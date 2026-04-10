const { CosmosClient } = require('@azure/cosmos');

const client = new CosmosClient(process.env.COSMOS_CONNECTION_STRING);
const database = client.database('marineiq');

module.exports = async function (context, req) {
    context.log('Logbook function called');

    const action = req.body && req.body.action;
    const userId = req.body && req.body.userId;

    if (!userId) {
        context.res = { status: 400, body: { error: 'userId is required' } };
        return;
    }

    try {
        switch (action) {

            case 'logTrip': {
                const container = database.container('trips');
                const trip = {
                    id: `trip-${Date.now()}`,
                    userId,
                    date: req.body.date || new Date().toISOString(),
                    departure: req.body.departure,
                    destination: req.body.destination,
                    hoursUnderway: req.body.hoursUnderway || 0,
                    hoursMotoring: req.body.hoursMotoring || 0,
                    nauticalMiles: req.body.nauticalMiles || 0,
                    crew: req.body.crew || 1,
                    conditions: req.body.conditions || '',
                    notes: req.body.notes || '',
                    certCategory: req.body.certCategory || null,
                    photos: req.body.photos || [],
                    createdAt: new Date().toISOString()
                };
                const { resource } = await container.items.create(trip);
                context.res = { status: 201, body: { success: true, trip: resource } };
                break;
            }

            case 'getTrips': {
                const container = database.container('trips');
                const { resources } = await container.items.query({
                    query: 'SELECT * FROM c WHERE c.userId = @userId ORDER BY c.date DESC',
                    parameters: [{ name: '@userId', value: userId }]
                }).fetchAll();
                const totalHours = resources.reduce((sum, t) => sum + (t.hoursUnderway || 0), 0);
                const totalMiles = resources.reduce((sum, t) => sum + (t.nauticalMiles || 0), 0);
                const totalMotoring = resources.reduce((sum, t) => sum + (t.hoursMotoring || 0), 0);
                context.res = {
                    status: 200,
                    body: {
                        trips: resources,
                        stats: {
                            totalTrips: resources.length,
                            totalHoursSailing: Math.round(totalHours * 10) / 10,
                            totalHoursMotoring: Math.round(totalMotoring * 10) / 10,
                            totalNauticalMiles: Math.round(totalMiles)
                        }
                    }
                };
                break;
            }

            case 'logMaintenance': {
                const container = database.container('maintenance');
                const entry = {
                    id: `maint-${Date.now()}`,
                    userId,
                    date: req.body.date || new Date().toISOString(),
                    description: req.body.description,
                    category: req.body.category,
                    engineHoursAtService: req.body.engineHoursAtService || 0,
                    nextDueEngineHours: req.body.nextDueEngineHours || null,
                    nextDueDate: req.body.nextDueDate || null,
                    laborHours: req.body.laborHours || 0,
                    cost: req.body.cost || 0,
                    technician: req.body.technician || 'Owner',
                    partIds: req.body.partIds || [],
                    notes: req.body.notes || '',
                    photos: req.body.photos || [],
                    createdAt: new Date().toISOString()
                };
                const { resource } = await container.items.create(entry);
                context.res = { status: 201, body: { success: true, entry: resource } };
                break;
            }

            case 'getMaintenance': {
                const container = database.container('maintenance');
                const { resources } = await container.items.query({
                    query: 'SELECT * FROM c WHERE c.userId = @userId ORDER BY c.date DESC',
                    parameters: [{ name: '@userId', value: userId }]
                }).fetchAll();
                context.res = { status: 200, body: { entries: resources } };
                break;
            }

            case 'logPart': {
                const container = database.container('parts');
                const part = {
                    id: `part-${Date.now()}`,
                    userId,
                    name: req.body.name,
                    manufacturer: req.body.manufacturer || '',
                    partNumber: req.body.partNumber || '',
                    category: req.body.category || '',
                    installDate: req.body.installDate || new Date().toISOString(),
                    lastReplacedDate: req.body.lastReplacedDate || null,
                    notes: req.body.notes || '',
                    photos: req.body.photos || [],
                    createdAt: new Date().toISOString()
                };
                const { resource } = await container.items.create(part);
                context.res = { status: 201, body: { success: true, part: resource } };
                break;
            }

            case 'getParts': {
                const container = database.container('parts');
                const { resources } = await container.items.query({
                    query: 'SELECT * FROM c WHERE c.userId = @userId ORDER BY c.category',
                    parameters: [{ name: '@userId', value: userId }]
                }).fetchAll();
                context.res = { status: 200, body: { parts: resources } };
                break;
            }

            case 'checkAlerts': {
                const maintContainer = database.container('maintenance');
                const currentEngineHours = req.body.currentEngineHours || 0;
                const { resources } = await maintContainer.items.query({
                    query: 'SELECT * FROM c WHERE c.userId = @userId AND c.nextDueEngineHours != null',
                    parameters: [{ name: '@userId', value: userId }]
                }).fetchAll();
                const alerts = resources.filter(m =>
                    m.nextDueEngineHours && currentEngineHours >= (m.nextDueEngineHours - 10)
                ).map(m => ({
                    description: m.description,
                    dueAt: m.nextDueEngineHours,
                    currentHours: currentEngineHours,
                    hoursRemaining: m.nextDueEngineHours - currentEngineHours,
                    overdue: currentEngineHours >= m.nextDueEngineHours
                }));
                context.res = { status: 200, body: { alerts } };
                break;
            }

            default:
                context.res = {
                    status: 400,
                    body: { error: 'action must be logTrip, getTrips, logMaintenance, getMaintenance, logPart, getParts or checkAlerts' }
                };
        }
    } catch (err) {
        context.log.error('Logbook error:', err.message);
        context.res = { status: 500, body: { error: err.message } };
    }
};