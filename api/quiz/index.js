const QUESTIONS = [
  // ===== COLREGS - SOUND SIGNALS =====
  {
    id: 1,
    category: "COLREGS",
    difficulty: "beginner",
    question: "What does a single prolonged blast every 2 minutes indicate in restricted visibility?",
    options: ["A vessel at anchor", "A power-driven vessel underway making way", "A vessel in distress", "A vessel not under command"],
    correct: 1,
    explanation: "Rule 35 — one prolonged blast every 2 minutes means a power-driven vessel is underway and making way through the water. Commit that sound to memory, sailor. It's the most common fog signal you'll hear."
  },
  {
    id: 2,
    category: "COLREGS",
    difficulty: "beginner",
    question: "In restricted visibility, a power-driven vessel underway but stopped and making no way through the water sounds what signal?",
    options: ["One prolonged blast every 2 minutes", "Two prolonged blasts every 2 minutes", "One short blast every minute", "Three short blasts every 2 minutes"],
    correct: 1,
    explanation: "Rule 35 — two prolonged blasts every 2 minutes. The vessel is stopped but still underway (not anchored or aground). One prolonged is making way, two prolonged is stopped. Know the difference — it tells you whether there's a vessel moving through the fog toward you."
  },
  {
    id: 3,
    category: "COLREGS",
    difficulty: "intermediate",
    question: "What sound signal does an anchored vessel sound in restricted visibility?",
    options: ["One prolonged blast every 2 minutes", "Two prolonged blasts every 2 minutes", "Rapid ringing of a bell for about 5 seconds every minute", "Three short blasts every minute"],
    correct: 2,
    explanation: "Rule 35 — a vessel at anchor rings a bell rapidly for about 5 seconds at intervals not exceeding one minute. Vessels over 100m also sound a gong aft. That bell means there's a stationary obstacle in the fog ahead of you — treat it like a reef."
  },
  {
    id: 4,
    category: "COLREGS",
    difficulty: "beginner",
    question: "What is the maneuvering signal for altering course to starboard?",
    options: ["One short blast", "Two short blasts", "Three short blasts", "One prolonged blast"],
    correct: 0,
    explanation: "Rule 34 — one short blast means 'I am altering my course to starboard.' Two short blasts means port. Three means your engines are going astern. These are signals of action, not intent. You're telling other vessels what you're doing, not asking permission."
  },
  {
    id: 5,
    category: "COLREGS",
    difficulty: "intermediate",
    question: "What is the danger signal under Rule 34?",
    options: ["Three prolonged blasts", "Five or more short and rapid blasts", "One prolonged followed by two short", "Four short blasts"],
    correct: 1,
    explanation: "Rule 34 — five or more short and rapid blasts is the danger or doubt signal. If you don't understand another vessel's intentions, or think a collision risk exists, lay on that horn. It doesn't matter if it's embarrassing — embarrassment heals, collisions don't."
  },
  {
    id: 6,
    category: "COLREGS",
    difficulty: "intermediate",
    question: "A vessel leaving a berth sounds what signal?",
    options: ["Three short blasts", "One prolonged blast", "Two short blasts", "Five short blasts"],
    correct: 1,
    explanation: "Rule 34 — one prolonged blast when leaving a berth or wharf. It warns anyone around the blind corner of the dock that a vessel is emerging. I've seen too many close calls at marina exits. Sound that horn every single time."
  },

  // ===== COLREGS - LIGHTS & SHAPES =====
  {
    id: 7,
    category: "COLREGS",
    difficulty: "beginner",
    question: "A vessel displays a red light over a white light at night. What type of vessel is it?",
    options: ["Vessel at anchor", "Fishing vessel", "Pilot vessel", "Vessel not under command"],
    correct: 1,
    explanation: "Red over white — fishing at night. There's an old saying: red over white, fishing at night. Burn that into your brain. These vessels have gear in the water and limited ability to maneuver out of your way."
  },
  {
    id: 8,
    category: "COLREGS",
    difficulty: "beginner",
    question: "What color is the port sidelight on a vessel?",
    options: ["Green", "White", "Red", "Yellow"],
    correct: 2,
    explanation: "Port is red. Starboard is green. Red left, green right — same as a traffic light on its side. I've drilled this into every sailor I've ever trained. Get it wrong on the water and you'll have a very bad night."
  },
  {
    id: 9,
    category: "COLREGS",
    difficulty: "beginner",
    question: "A power-driven vessel underway at night shows which lights?",
    options: ["Masthead light, sternlight, and sidelights", "Two masthead lights and sidelights only", "Sidelights and anchor light", "Masthead light and sternlight only"],
    correct: 0,
    explanation: "Rule 23 — a power-driven vessel underway shows a masthead light forward, sidelights (red to port, green to starboard), and a sternlight (white, aft). Vessels over 50m add a second masthead light aft and higher. Learn these cold — they tell you what a vessel is and where it's headed."
  },
  {
    id: 10,
    category: "COLREGS",
    difficulty: "intermediate",
    question: "Two red lights in a vertical line displayed by a vessel at night indicate what?",
    options: ["Vessel constrained by draft", "Vessel not under command", "Vessel restricted in ability to maneuver", "Vessel aground"],
    correct: 1,
    explanation: "Rule 27 — two red lights in a vertical line means not under command (NUC). This vessel has lost its ability to maneuver — mechanical failure, loss of steering, whatever. It cannot get out of your way. Give it a very wide berth and expect no action from it."
  },
  {
    id: 11,
    category: "COLREGS",
    difficulty: "intermediate",
    question: "A vessel restricted in its ability to maneuver (RAM) displays which lights in a vertical line?",
    options: ["Two red lights", "Red-white-red", "Three white lights", "Red over white over green"],
    correct: 1,
    explanation: "Rule 27 — red-white-red in a vertical line means restricted in ability to maneuver. These vessels are doing dredging, surveying, cable laying, replenishment — work that limits their maneuverability. Give them room to work and stay well clear."
  },
  {
    id: 12,
    category: "COLREGS",
    difficulty: "intermediate",
    question: "What day shape does a vessel not under command display?",
    options: ["A cylinder", "Two black balls in a vertical line", "A cone, apex down", "A diamond"],
    correct: 1,
    explanation: "Rule 27 — two black balls in a vertical line for a vessel not under command. Day shapes are your daytime substitute for lights. Two balls = NUC. If you see those balls, that vessel is in trouble and cannot maneuver. Stand clear."
  },
  {
    id: 13,
    category: "COLREGS",
    difficulty: "intermediate",
    question: "A vessel constrained by her draft displays which day shape?",
    options: ["Two black balls in a vertical line", "A cylinder", "A cone point downward", "A diamond shape"],
    correct: 1,
    explanation: "Rule 28 — a cylinder. Vessels constrained by draft have very limited options — they can't just alter course to avoid you. When you see that cylinder, give them a wide berth and plan your crossing carefully."
  },
  {
    id: 14,
    category: "COLREGS",
    difficulty: "beginner",
    question: "A vessel at anchor by day displays what shape?",
    options: ["A cylinder", "A cone apex down", "A black ball", "A diamond"],
    correct: 2,
    explanation: "Rule 30 — one black ball in the forward part of the vessel. Simple to remember. One ball means anchored. If you're entering an anchorage and can't see anchor lights at night, look for that ball during the day to identify anchored vessels."
  },
  {
    id: 15,
    category: "COLREGS",
    difficulty: "advanced",
    question: "A vessel towing where the length of tow exceeds 200 meters displays how many masthead lights?",
    options: ["One masthead light", "Two masthead lights", "Three masthead lights", "No masthead lights — only towing light"],
    correct: 2,
    explanation: "Rule 24 — when the length of the tow exceeds 200 meters, the towing vessel shows three masthead lights in a vertical line. Two lights for tows 200m or less. This tells you the tow is extremely long — there could be a quarter-mile of cable and a barge behind that vessel you can barely see."
  },
  {
    id: 16,
    category: "COLREGS",
    difficulty: "intermediate",
    question: "What lights does a sailing vessel show when also using its engine (motorsailing)?",
    options: ["Sailing vessel lights only", "Power vessel lights only", "Sailing vessel lights plus a cone shape apex down", "Power vessel lights plus an extra white light"],
    correct: 1,
    explanation: "Rule 25 — when motorsailing, a sailing vessel is treated as a power-driven vessel and must show power vessel lights. By day it must display a cone shape, apex downward, forward. If the engine is running and driving you, you're a power vessel. No special status for 'motorsailing.'"
  },
  {
    id: 17,
    category: "COLREGS",
    difficulty: "beginner",
    question: "What color light does a vessel show at its stern?",
    options: ["Red", "Green", "White", "Yellow"],
    correct: 2,
    explanation: "Rule 21 — the sternlight is white, visible over an arc of 135 degrees centered on dead astern. If you're seeing a white light only from another vessel, you may be looking at their stern — they're moving away from you, or you're overtaking them. That changes your obligations significantly."
  },
  {
    id: 18,
    category: "COLREGS",
    difficulty: "advanced",
    question: "A pilot vessel on duty displays which lights at the masthead?",
    options: ["White over red", "Red over white", "Two white lights", "White flashing light only"],
    correct: 0,
    explanation: "Rule 29 — pilot vessels on duty show white over red at the masthead, plus normal underway lights when making way. The white-over-red combination is unique to pilot vessels. In port approaches, when you see white over red, a pilot boat is working — give them room to do their job."
  },
  {
    id: 19,
    category: "COLREGS",
    difficulty: "advanced",
    question: "What is the arc of visibility for a masthead (steaming) light?",
    options: ["112.5 degrees centered on the bow", "225 degrees centered on the bow", "360 degrees", "135 degrees centered on the bow"],
    correct: 1,
    explanation: "Rule 21 — the masthead light covers 225 degrees, from dead ahead sweeping 112.5 degrees to each side. The sternlight covers the remaining 135 degrees. Sidelights each cover 112.5 degrees. Understanding arc of visibility tells you what a vessel is doing based on which lights you can see."
  },
  {
    id: 20,
    category: "COLREGS",
    difficulty: "advanced",
    question: "A vessel aground shows which additional signal by night beyond normal anchor lights?",
    options: ["Three red lights in vertical line", "Three white lights in vertical line", "Three all-around white flashes", "Red over white over red in vertical line"],
    correct: 0,
    explanation: "Rule 30 — a vessel aground shows anchor light(s) plus three red lights in a vertical line. This warns other vessels of a hazard in the water. If you run aground, get your anchor lights up immediately and add those three red lights. Other vessels need to know you're there and you're not going anywhere."
  },

  // ===== COLREGS - STEERING & SAILING RULES =====
  {
    id: 21,
    category: "COLREGS",
    difficulty: "intermediate",
    question: "You are a power vessel and see a sailing vessel on your port bow. Who gives way?",
    options: ["You give way — sail has priority over power", "The sailing vessel gives way — it's on your port side", "Both vessels alter course to starboard", "The faster vessel gives way"],
    correct: 0,
    explanation: "Rule 18 — power gives way to sail. Simple as that. Unless that sailing vessel is overtaking you, in which case the overtaking vessel always gives way regardless of propulsion."
  },
  {
    id: 22,
    category: "COLREGS",
    difficulty: "intermediate",
    question: "Two power vessels are meeting head-on. What action should both vessels take?",
    options: ["The vessel with the wind on its port side gives way", "Both alter course to starboard", "The smaller vessel gives way", "The vessel on the port side gives way"],
    correct: 1,
    explanation: "Rule 14 — head-on situation, both vessels alter course to starboard so they pass port-to-port. If in doubt whether it's a crossing or head-on situation, treat it as head-on. Pass port to port."
  },
  {
    id: 23,
    category: "COLREGS",
    difficulty: "intermediate",
    question: "In a crossing situation between two power vessels, which vessel gives way?",
    options: ["The vessel with the other on its port side", "The vessel with the other on its starboard side", "The slower vessel", "The smaller vessel"],
    correct: 1,
    explanation: "Rule 15 — when two power vessels cross, the vessel with the other on its starboard side gives way. Think of it as: if you see a vessel on your starboard, you're the give-way vessel. Give way early and clearly — don't force the other skipper to guess your intentions."
  },
  {
    id: 24,
    category: "COLREGS",
    difficulty: "intermediate",
    question: "What is the stand-on vessel required to do under Rule 17?",
    options: ["Immediately alter course away from the give-way vessel", "Maintain course and speed, but may take action if collision is imminent", "Sound five short blasts and stop", "Slow down and let the other vessel pass"],
    correct: 1,
    explanation: "Rule 17 — the stand-on vessel maintains course and speed. BUT — if the give-way vessel fails to act, the stand-on vessel must take action to avoid collision. You cannot use 'I had right of way' as an excuse for a collision. Both vessels must act to prevent it."
  },
  {
    id: 25,
    category: "COLREGS",
    difficulty: "intermediate",
    question: "Under Rule 13, when are you considered an overtaking vessel?",
    options: ["When a vessel is within 10 degrees of dead astern of another", "When coming from more than 22.5 degrees abaft the beam of another", "When approaching at higher speed from any direction", "When within visual range and moving faster"],
    correct: 1,
    explanation: "Rule 13 — you're overtaking if you're coming from more than 22.5 degrees abaft the beam — the arc where you'd see only the sternlight. Once overtaking, you keep out of the way until you're finally past and clear. Overtaking rules override all other rules — even sail gives way to power if overtaking."
  },
  {
    id: 26,
    category: "COLREGS",
    difficulty: "advanced",
    question: "In a narrow channel, which vessel has priority — a large vessel constrained to the channel, or a small fishing vessel crossing the channel?",
    options: ["The fishing vessel — it was there first", "The large vessel — it cannot safely deviate", "Both share equal responsibility", "Whichever vessel is moving faster"],
    correct: 1,
    explanation: "Rule 9 — in a narrow channel, vessels that can only safely navigate within the channel have priority. Small vessels and fishing vessels shall not impede their passage. That tanker cannot stop or turn — you can. Get out of its way."
  },
  {
    id: 27,
    category: "COLREGS",
    difficulty: "advanced",
    question: "In a narrow channel, on which side should a vessel keep when safe and practicable?",
    options: ["The center of the channel", "The starboard side of the channel", "The port side of the channel", "Whichever side is deeper"],
    correct: 1,
    explanation: "Rule 9 — keep to the starboard side of the channel. Same as a road. Everyone keeps right, traffic flows. It sounds obvious but I've seen skippers hug the wrong side and cause serious close calls in narrow passes."
  },
  {
    id: 28,
    category: "COLREGS",
    difficulty: "advanced",
    question: "Vessels crossing a Traffic Separation Scheme (TSS) must do so at what angle to the traffic flow?",
    options: ["At least 45 degrees", "At right angles (90 degrees)", "At the smallest angle possible", "Parallel to the traffic lanes"],
    correct: 1,
    explanation: "Rule 10 — vessels crossing a TSS must do so at right angles to the direction of traffic flow. This minimizes your time in the lane and makes your intentions clear to other vessels. Sneaking across at a shallow angle is dangerous and illegal."
  },
  {
    id: 29,
    category: "COLREGS",
    difficulty: "advanced",
    question: "Under Rule 19, if you hear a fog signal forward of your beam and cannot determine collision risk, what should you do?",
    options: ["Maintain course and speed and sound danger signal", "Reduce speed to the minimum needed to maintain steerage and navigate with extreme caution", "Alter course to starboard immediately", "Stop and wait for visibility to improve"],
    correct: 1,
    explanation: "Rule 19 — reduce speed to the minimum needed to maintain steerage and navigate with extreme caution. You cannot apply right-of-way rules in restricted visibility without visual contact. Slow down, use your radar if you have it, and proceed with maximum caution."
  },
  {
    id: 30,
    category: "COLREGS",
    difficulty: "intermediate",
    question: "Under Rule 5, a proper lookout requires:",
    options: ["Visual watch only during daylight hours", "Visual and aural watch by all available means at all times", "Radar watch only in restricted visibility", "A designated watch officer separate from the helmsman"],
    correct: 1,
    explanation: "Rule 5 — proper lookout means visual and aural watch using all available means, at all times. That means eyes, ears, radar, AIS — everything you have. A lookout distracted by their phone isn't a proper lookout. This rule is why collisions are never truly 'unavoidable.'"
  },
  {
    id: 31,
    category: "COLREGS",
    difficulty: "intermediate",
    question: "What is the hierarchy of vessel privilege from most privileged to least?",
    options: ["NUC, RAM, CBD, Fishing, Sail, Power", "CBD, RAM, NUC, Fishing, Sail, Power", "Fishing, NUC, RAM, CBD, Sail, Power", "NUC, CBD, RAM, Fishing, Power, Sail"],
    correct: 0,
    explanation: "Rule 18 — not under command first (most privileged), then restricted ability to maneuver, then constrained by draft, then fishing vessels, then sailing vessels, then power-driven vessels (least privileged). The hierarchy is based on ability to maneuver. The less able, the more right of way."
  },
  {
    id: 32,
    category: "COLREGS",
    difficulty: "intermediate",
    question: "What does Rule 2 state about 'special circumstances'?",
    options: ["Special circumstances override all other rules at the captain's discretion", "Nothing in the rules excuses neglect, but departures from the rules may be necessary to avoid immediate danger", "Special circumstances apply only in restricted visibility", "Rule 2 applies only to commercial vessels"],
    correct: 1,
    explanation: "Rule 2 is the 'General Responsibility' rule — departures from the rules may be necessary to avoid immediate danger, but nothing exonerates neglect. It's the rule that says 'use your judgment.' If following a rule would cause a collision, depart from it. But Rule 2 is not a blank check to ignore the rules whenever convenient."
  },
  {
    id: 33,
    category: "COLREGS",
    difficulty: "intermediate",
    question: "When is a vessel considered 'underway' under COLREGS?",
    options: ["When the engine is running", "When not at anchor, made fast to shore, or aground", "When making way through the water", "When proceeding under power only"],
    correct: 1,
    explanation: "Rule 3 defines 'underway' as not at anchor, not made fast to shore, and not aground. A vessel underway may or may not be making way — it could be drifting. This is important because underway vessels have different obligations than anchored or grounded vessels."
  },
  {
    id: 34,
    category: "COLREGS",
    difficulty: "intermediate",
    question: "What is the definition of 'restricted visibility' under COLREGS?",
    options: ["Visibility under 1 nautical mile", "Any condition where visibility is reduced by fog, mist, falling snow, heavy rain, sandstorms, or similar", "Nighttime operations only", "Visibility under 0.5 nautical miles"],
    correct: 1,
    explanation: "Rule 3 defines restricted visibility as any condition limiting visibility — fog, mist, falling snow, heavy rain, sandstorms. There's no fixed distance threshold. Rule 19 applies whenever you can't see clearly enough to assess a collision risk by eye. If in doubt, apply Rule 19."
  },
  {
    id: 35,
    category: "COLREGS",
    difficulty: "advanced",
    question: "A vessel fishing with gear extending more than 150 meters shows what day shape pointing toward the gear?",
    options: ["A cone apex downward", "Two cones apex toward each other", "A basket", "A cylinder"],
    correct: 0,
    explanation: "Rule 26 — a vessel fishing with gear extending more than 150 meters shows a cone apex downward pointing in the direction of the gear. This tells other vessels which way the gear extends. Running over fishing gear is dangerous and likely your fault. Give fishing vessels a wide berth."
  },

  // ===== NAVIGATION =====
  {
    id: 36,
    category: "Navigation",
    difficulty: "beginner",
    question: "What does a flashing yellow light on a buoy indicate?",
    options: ["Danger — submerged wreck", "Caution — this is a special mark", "Safe water — mid-channel", "Anchorage area"],
    correct: 1,
    explanation: "Yellow marks special purpose — it could be a traffic separation scheme, a military exercise area, or an aquaculture zone. The light characteristic and chart will tell you the details. Always check your chart."
  },
  {
    id: 37,
    category: "Navigation",
    difficulty: "beginner",
    question: "Which side of a channel should you keep to when entering a US port from sea?",
    options: ["Keep red buoys on your port side", "Keep red buoys on your starboard side", "Stay in the center of the channel", "Keep green buoys on your port side"],
    correct: 1,
    explanation: "Red Right Returning — keep the red buoys on your starboard side when returning to port. One of the oldest rules in American seamanship. Forget it and you'll find the bottom of the channel the hard way."
  },
  {
    id: 38,
    category: "Navigation",
    difficulty: "beginner",
    question: "On a nautical chart, what does a sounding number represent?",
    options: ["The height of a feature above sea level", "The depth of water at Mean Lower Low Water (MLLW)", "The distance from shore", "The tidal range at that location"],
    correct: 1,
    explanation: "Chart soundings are referenced to Mean Lower Low Water (MLLW) — the average of the lower of the two daily low tides. This gives you the least depth to expect. The actual depth may be more at high tide — but could be close to the charted depth at extreme low tide. Always add tide height to get actual depth."
  },
  {
    id: 39,
    category: "Navigation",
    difficulty: "intermediate",
    question: "Magnetic variation is the difference between:",
    options: ["True north and magnetic north", "Compass north and magnetic north", "True north and compass north", "Magnetic north and grid north"],
    correct: 0,
    explanation: "Magnetic variation (declination) is the angle between true north and magnetic north at a given location. It varies by location and changes slowly over time. Check the compass rose on your chart. Always account for variation when converting between true and magnetic courses."
  },
  {
    id: 40,
    category: "Navigation",
    difficulty: "intermediate",
    question: "Compass deviation is caused by:",
    options: ["The geographic position of magnetic north", "Magnetic influences from the vessel itself", "Solar and atmospheric interference", "Chart projection errors"],
    correct: 1,
    explanation: "Deviation is the error in your compass caused by magnetic materials on your own vessel — engines, electronics, tools, even a steel thermos left near the binnacle. Unlike variation, deviation changes with your heading. You need a deviation card for your specific vessel. Swing your compass after any major equipment changes."
  },
  {
    id: 41,
    category: "Navigation",
    difficulty: "intermediate",
    question: "To convert a true course to a magnetic course, you:",
    options: ["Add easterly variation, subtract westerly variation", "Subtract easterly variation, add westerly variation", "Always add variation", "Always subtract variation"],
    correct: 1,
    explanation: "True to Magnetic: subtract easterly variation, add westerly variation. Memory aid: 'East is least, West is best' — subtract east, add west when going True to Magnetic. Going Magnetic to True: reverse it. Get this wrong and you'll be sailing the wrong direction — possibly into a hazard."
  },
  {
    id: 42,
    category: "Navigation",
    difficulty: "beginner",
    question: "What does a green can buoy mark?",
    options: ["The right side of a channel when returning from sea", "The left side of a channel when returning from sea", "A hazard in open water", "A safe anchorage area"],
    correct: 1,
    explanation: "Green cans mark the port (left) side of the channel when returning from sea — meaning you leave them to port when heading into port. They're numbered with odd numbers. Remember: green goes on your left when going in. Red nuns on your right."
  },
  {
    id: 43,
    category: "Navigation",
    difficulty: "intermediate",
    question: "A safe water mark (fairway buoy) is identified by:",
    options: ["Red and green horizontal bands", "Red and white vertical stripes", "Yellow and black bands", "Green with white stripes"],
    correct: 1,
    explanation: "Safe water marks have red and white vertical stripes. They indicate navigable water all around — they're often at channel entrances or mid-channel. A red and white striped buoy means safe water in all directions. They're the 'all clear' mark of the buoyage system."
  },
  {
    id: 44,
    category: "Navigation",
    difficulty: "advanced",
    question: "What is the effect of a 1-knot following current on a vessel making 6 knots through the water?",
    options: ["Speed over ground increases to 7 knots", "Speed over ground decreases to 5 knots", "Speed over ground stays at 6 knots", "The current has no effect on speed"],
    correct: 0,
    explanation: "A following current adds to your speed over ground (SOG). 6 knots through the water plus 1 knot of current = 7 knots SOG. This also affects your navigation — your actual track is faster than your engine output suggests. Always account for current in your ETA calculations."
  },
  {
    id: 45,
    category: "Navigation",
    difficulty: "intermediate",
    question: "What is a range in navigation?",
    options: ["The maximum distance your radar can detect", "Two objects in line indicating a vessel is on a specific bearing or track", "The distance between two waypoints", "The spread of a compass bearing"],
    correct: 1,
    explanation: "A range is two fixed objects that, when lined up, tell you you're on a specific bearing or course line. It's one of the most accurate position-fixing methods available. When the front and rear range markers are in line, you know exactly where you are laterally. Channel ranges are posted specifically for this purpose."
  },
  {
    id: 46,
    category: "Navigation",
    difficulty: "advanced",
    question: "What does 'estimated position' (EP) mean in navigation?",
    options: ["A position confirmed by two or more LOPs", "A position derived from last known position using course, speed, and estimated current/leeway", "A GPS-derived position", "A position based on radar bearings"],
    correct: 1,
    explanation: "An EP is your best guess of position accounting for course, speed, time elapsed, and estimated effects of current and leeway. It's more reliable than dead reckoning (DR) alone. In fog, without GPS, your EP is your life. Keep it updated continuously."
  },
  {
    id: 47,
    category: "Navigation",
    difficulty: "intermediate",
    question: "What is the primary tide datum for US charts and tide tables?",
    options: ["Mean Sea Level (MSL)", "Mean High Water (MHW)", "Mean Lower Low Water (MLLW)", "Mean Tide Level (MTL)"],
    correct: 2,
    explanation: "MLLW — Mean Lower Low Water — is the tide datum for US charts and tide tables. Depths on charts are measured from MLLW, giving you the least water you'll typically have. At extreme low tides, you may have even less water than charted. Never assume the chart gives you the actual depth — add the tide height to get current depth."
  },
  {
    id: 48,
    category: "Navigation",
    difficulty: "advanced",
    question: "In celestial navigation, what instrument measures the altitude of a celestial body above the horizon?",
    options: ["Compass", "Barometer", "Sextant", "Pelorus"],
    correct: 2,
    explanation: "A sextant measures the angle between a celestial body and the visible horizon. That angle, combined with exact time and the Nautical Almanac, gives you a line of position. Two or more sights gives you a fix. It's the original GPS — and it still works when satellites fail."
  },
  {
    id: 49,
    category: "Navigation",
    difficulty: "intermediate",
    question: "What does 'COG' stand for in navigation?",
    options: ["Course Over Ground", "Compass Orientation Guide", "Current Offset Gauge", "Chart Origin Grid"],
    correct: 0,
    explanation: "COG — Course Over Ground — is your actual track across the earth's surface, accounting for current and leeway. It differs from your heading when there's current or wind. Your GPS shows COG, not heading. The difference between COG and heading tells you how much you're being set off course."
  },
  {
    id: 50,
    category: "Navigation",
    difficulty: "advanced",
    question: "What is the difference between a rhumb line and a great circle route?",
    options: ["A rhumb line is the shortest distance; a great circle is a constant magnetic course", "A great circle is the shortest distance between two points on a sphere; a rhumb line crosses all meridians at the same angle", "They are identical for east-west passages", "A great circle is used in the tropics; a rhumb line in polar regions"],
    correct: 1,
    explanation: "A great circle is the shortest distance between two points on a sphere — the route used for long ocean passages. A rhumb line maintains a constant compass course but is actually longer than a great circle except on the equator. For coastal passages, rhumb lines work fine. For transocean voyages, great circle routes save significant distance and fuel."
  },
  {
    id: 51,
    category: "Navigation",
    difficulty: "advanced",
    question: "What is a 'running fix'?",
    options: ["A position fix taken while underway at maximum speed", "A fix derived from two bearings on the same object taken at different times, advanced for the run between them", "A GPS position updated in real-time", "A fix using two bearings on different objects taken simultaneously"],
    correct: 1,
    explanation: "A running fix uses two bearings on the same object taken at different times. You advance the first LOP along the course line for the distance run between bearings. Where the advanced LOP intersects the new LOP is your fix. Invaluable when only one identifiable object is available."
  },
  {
    id: 52,
    category: "Navigation",
    difficulty: "advanced",
    question: "What is leeway in sailing?",
    options: ["Extra speed added by a favorable wind", "The sideways drift of a vessel caused by wind pressure on the hull and rigging", "The difference between magnetic and compass course", "The angle between true course and rhumb line"],
    correct: 1,
    explanation: "Leeway is the sideways drift caused by wind pushing on your hull and rigging. It makes your actual track through the water differ from the direction your bow is pointed. In strong beam winds, leeway can be significant — always account for it when plotting your course."
  },
  {
    id: 53,
    category: "Navigation",
    difficulty: "intermediate",
    question: "What does 'set and drift' refer to?",
    options: ["The tendency of a vessel to weathervane into the wind", "The direction (set) and speed (drift) of a current", "The leeway caused by wind pressure", "The movement of a vessel at anchor in a tidal stream"],
    correct: 1,
    explanation: "Set is the direction a current is flowing TO. Drift is its speed. If the current sets you to the east at 2 knots, your set is 090 and your drift is 2 knots. Always account for set and drift when planning a coastal passage — ignoring it is how boats end up on rocks."
  },

  // ===== SEAMANSHIP =====
  {
    id: 54,
    category: "Seamanship",
    difficulty: "beginner",
    question: "What is the recommended minimum scope for anchoring in fair weather?",
    options: ["3:1", "5:1", "7:1", "10:1"],
    correct: 1,
    explanation: "Scope is the ratio of anchor rode length to depth of water at high tide plus height of bow chock. 5:1 minimum in fair weather, 7:1 or more when it's blowing. More scope = more catenary = better holding. I've seen boats drag in flat calm on 3:1 scope. Give your anchor a fighting chance."
  },
  {
    id: 55,
    category: "Seamanship",
    difficulty: "beginner",
    question: "What is the most reliable knot for forming a fixed loop at the end of a line?",
    options: ["Clove hitch", "Sheet bend", "Bowline", "Figure-eight knot"],
    correct: 2,
    explanation: "The bowline. It forms a fixed loop that doesn't slip or jam, and unties easily even after heavy loading. Every sailor on my boats knew how to tie a bowline with their eyes closed. 'The rabbit comes out of the hole, goes around the tree, and back down the hole.' Practice until it's muscle memory."
  },
  {
    id: 56,
    category: "Seamanship",
    difficulty: "beginner",
    question: "What knot is used to secure a line to a cleat?",
    options: ["Bowline", "Cleat hitch", "Round turn and two half hitches", "Clove hitch"],
    correct: 1,
    explanation: "A cleat hitch. Take a round turn around the base, cross over the top in a figure-eight pattern, and finish with a locking half hitch. It holds under load and unties easily. Learn it cold — you'll use it every time you dock."
  },
  {
    id: 57,
    category: "Seamanship",
    difficulty: "intermediate",
    question: "What is the purpose of a spring line when docking?",
    options: ["To hold the vessel off the dock when wind blows toward it", "To prevent fore-and-aft movement along the dock", "To keep the bow at a fixed angle to the dock", "To absorb shock when the vessel bumps the dock"],
    correct: 1,
    explanation: "Spring lines run fore and aft along the vessel to prevent it sliding forward or backward along the dock. A forward spring prevents the stern from swinging out. An aft spring holds the bow in. Spring lines and breast lines together hold a vessel properly."
  },
  {
    id: 58,
    category: "Seamanship",
    difficulty: "intermediate",
    question: "When should you heave to?",
    options: ["When entering a harbor in a strong wind", "When you need to stop or dramatically slow the vessel at sea in heavy conditions", "When anchoring in a current", "When picking up a mooring in a crosswind"],
    correct: 1,
    explanation: "Heaving to is a technique for stopping or dramatically slowing a sailboat at sea — useful in heavy weather to reduce strain, eat a meal, rest, or ride out a storm. Back the jib, ease the main, lash the tiller to leeward. A powerful tool every offshore sailor must know."
  },
  {
    id: 59,
    category: "Seamanship",
    difficulty: "advanced",
    question: "What is the 'danger bearing' technique used for?",
    options: ["Identifying vessels in a crossing situation", "Ensuring a vessel does not get too close to a hazard by monitoring a bearing to it", "Measuring the distance to a squall line", "Calculating the risk of collision in fog"],
    correct: 1,
    explanation: "A danger bearing is a compass bearing that, if crossed, means you're in danger of hitting a hazard. Plot the bearing on the chart, then monitor your compass. If the hazard's bearing moves past the danger bearing in the wrong direction, alter course immediately. A simple, reliable technique for clearing headlands and shoals in poor visibility."
  },
  {
    id: 60,
    category: "Seamanship",
    difficulty: "intermediate",
    question: "What is 'broaching' in heavy weather sailing?",
    options: ["Taking water over the bow in head seas", "Losing steering and turning violently beam-on to the sea", "Running dead downwind in large swells", "The vessel rolling beyond its righting moment"],
    correct: 1,
    explanation: "Broaching is when a vessel loses directional control and rounds up violently into the wind or beam to the sea — usually when running in large following seas. It can lead to a knockdown or capsize. Reduce sail early, avoid running dead downwind in big seas, and consider heaving to in extreme conditions."
  },
  {
    id: 61,
    category: "Seamanship",
    difficulty: "advanced",
    question: "What is 'prop walk' and which way does a right-handed propeller kick the stern in reverse?",
    options: ["Prop walk kicks stern to starboard; right-hand prop kicks starboard in reverse", "Prop walk kicks stern to port; right-hand prop kicks stern to port in reverse", "Prop walk is forward momentum — no directional effect", "Prop walk depends on RPM, not prop rotation direction"],
    correct: 1,
    explanation: "A right-handed propeller (rotates clockwise in forward when viewed from astern) kicks the stern to port in reverse. This is prop walk, most pronounced at slow speeds. Experienced skippers use prop walk deliberately — backing into a port-side berth with a right-hand prop becomes natural with practice. Know your prop rotation and use it to your advantage."
  },
  {
    id: 62,
    category: "Seamanship",
    difficulty: "advanced",
    question: "What is Mediterranean (Med) mooring?",
    options: ["Mooring with two anchors set 180 degrees apart", "Anchoring bow-to with a stern line to a quay, common in crowded harbors", "Using anchor chains criss-crossed to prevent swinging", "Tying up alongside another vessel (rafting)"],
    correct: 1,
    explanation: "Med mooring — you drop a bow anchor, back down toward the dock, and secure stern lines to the quay. Common in Mediterranean ports where dock space is scarce. It requires accurate boat handling and quick work with stern lines. Learn it before you visit European waters."
  },

  // ===== SAFETY =====
  {
    id: 63,
    category: "Safety",
    difficulty: "beginner",
    question: "What is the first action when a person falls overboard?",
    options: ["Radio the Coast Guard immediately", "Throw a life ring and shout 'man overboard'", "Start the engine", "Note your GPS position"],
    correct: 1,
    explanation: "Throw flotation and keep eyes on them — never lose sight of the person in the water. Everything else follows. I've seen skippers radio the Coast Guard first while the person drifted away. Eyes on the casualty, always."
  },
  {
    id: 64,
    category: "Safety",
    difficulty: "beginner",
    question: "What does a vessel in distress use to signal its position at night?",
    options: ["Red parachute flares or red hand flares", "White flares only", "Orange smoke signals", "Continuous sounding of the foghorn"],
    correct: 0,
    explanation: "Red is the international color of distress. Red parachute flares are visible for miles at night. Orange smoke is for daytime. White flares are NOT distress signals — they're used to illuminate an area. Never confuse them."
  },
  {
    id: 65,
    category: "Safety",
    difficulty: "beginner",
    question: "MAYDAY — what does it mean and how is it transmitted?",
    options: ["Urgency — requires assistance when convenient", "Life-threatening emergency requiring immediate assistance — broadcast on Channel 16 three times", "Warning of navigational hazard only", "Medical emergency only"],
    correct: 1,
    explanation: "MAYDAY means life-threatening emergency requiring immediate assistance. Three times: MAYDAY MAYDAY MAYDAY. Then your vessel name three times, position, nature of distress, number of persons aboard, and condition of vessel. Broadcast on VHF Channel 16."
  },
  {
    id: 66,
    category: "Safety",
    difficulty: "beginner",
    question: "What VHF channel is the international hailing and distress channel?",
    options: ["Channel 6", "Channel 9", "Channel 16", "Channel 22"],
    correct: 2,
    explanation: "Channel 16 is the international hailing and distress frequency. All vessels equipped with VHF radio are required to monitor Channel 16 when underway. It's the lifeline — the channel the Coast Guard monitors, the channel you call MAYDAY on. Never leave it unwatched."
  },
  {
    id: 67,
    category: "Safety",
    difficulty: "intermediate",
    question: "What is a PAN-PAN call?",
    options: ["An all-ships safety broadcast", "An urgency call — serious situation, not immediately life-threatening", "A distress call for immediate danger to life", "A navigational warning about a hazard"],
    correct: 1,
    explanation: "PAN-PAN is the urgency signal — less urgent than MAYDAY but still serious. Use it for an injured person needing medical assistance, a vessel with mechanical failure drifting toward shore, or a vessel taking on water but not immediately sinking. Say it three times on Channel 16."
  },
  {
    id: 68,
    category: "Safety",
    difficulty: "intermediate",
    question: "What is a SECURITE call used for?",
    options: ["To alert all vessels to a navigational or meteorological hazard", "To request immediate medical assistance", "To signal a man overboard situation", "To call the Coast Guard for a vessel inspection"],
    correct: 0,
    explanation: "SECURITE (say-cure-ee-TAY) is the safety signal for important navigational or meteorological warnings. Say it three times, then broadcast the information. Use it to report unlit debris, a submerged container, or other hazards to navigation. Keep other mariners informed."
  },
  {
    id: 69,
    category: "Safety",
    difficulty: "beginner",
    question: "How should you fight an electrical fire on a vessel?",
    options: ["Use water to cool the burning components", "Use a CO2 or dry chemical extinguisher, never water", "Disconnect shore power first, then use any extinguisher", "Only halon systems are effective on electrical fires"],
    correct: 1,
    explanation: "Never use water on an electrical fire — water conducts electricity and you'll make things far worse. CO2 extinguishers are ideal — no residue, no conductivity. Dry chemical works but leaves a mess. If you can safely cut the power first, do it, but don't wait if the fire is spreading."
  },
  {
    id: 70,
    category: "Safety",
    difficulty: "intermediate",
    question: "What is the minimum PFD requirement for recreational vessels?",
    options: ["One Type I PFD per person on board", "One wearable PFD (Type I, II, or III) per person on board", "Two PFDs per person — one for use, one for backup", "PFDs only required for children under 13"],
    correct: 1,
    explanation: "Federal law requires one wearable PFD (Type I, II, or III) for every person on board. Vessels 16 feet or longer must also carry one Type IV throwable device. Children under 13 in most states must WEAR a PFD underway. A PFD in the locker doesn't save lives."
  },
  {
    id: 71,
    category: "Safety",
    difficulty: "intermediate",
    question: "What is an EPIRB?",
    options: ["Emergency Position Indicating Radio Beacon — transmits distress signal to satellites for SAR", "Engine Performance Indicator and Reporting Box", "Electronic Piloting and Inertial Reference Buoy", "Emergency Position Indicating Radio Beacon for VHF distress"],
    correct: 0,
    explanation: "EPIRB — Emergency Position Indicating Radio Beacon. It transmits on 406 MHz to COSPAS-SARSAT satellites, which relay your position to the Coast Guard. Modern EPIRBs give your GPS position to within 100 meters. Register it with NOAA — an unregistered EPIRB sends rescuers to the right ocean but not to you."
  },
  {
    id: 72,
    category: "Safety",
    difficulty: "intermediate",
    question: "What is the correct procedure for launching a life raft?",
    options: ["Throw it overboard, pull the painter line until it inflates, then board from the water", "Inflate it on deck first, then lower into the water", "Board it on deck and lower yourself into the water seated inside", "Throw it overboard and jump in after it"],
    correct: 0,
    explanation: "Throw the life raft overboard in its container while secured by the painter, pull the painter until taut, then give a sharp tug to activate CO2 inflation. Board the raft from the vessel's deck or waterline — try to stay dry. 'Step up into the raft, never jump in.' Hypothermia kills faster in water than air."
  },
  {
    id: 73,
    category: "Safety",
    difficulty: "beginner",
    question: "How should you enter the water if you must abandon ship without a life raft?",
    options: ["Dive headfirst to get clear of the vessel quickly", "Jump feet first, ankles crossed, holding your PFD down firmly", "Fall backward from the deck", "Jump from the bow to avoid the propeller"],
    correct: 1,
    explanation: "Jump feet first, legs together, ankles crossed, one hand holding your nose and the other pressing your PFD down. Crossing your ankles protects against perineal injuries from water impact. Holding the PFD prevents it riding up and striking your face or neck."
  },
  {
    id: 74,
    category: "Safety",
    difficulty: "intermediate",
    question: "What is the 'HELP' position for cold water immersion survival?",
    options: ["Hold Equipment, Listen, Position, yell", "Heat Escape Lessening Position — knees to chest, arms tight against sides to retain body heat", "The standard floating position on your back with PFD", "Hands-up Emergency Life Position — wave for rescue while floating vertically"],
    correct: 1,
    explanation: "HELP — Heat Escape Lessening Position. Pull your knees to your chest, wrap your arms around your legs, and minimize body surface area exposed to cold water. It can extend survival time significantly. If multiple people are in the water, huddle together — sides touching, arms around each other."
  },
  {
    id: 75,
    category: "Safety",
    difficulty: "intermediate",
    question: "What is the primary danger of carbon monoxide (CO) on a vessel?",
    options: ["CO is only dangerous below decks — cockpit exposure is safe", "CO is odorless, colorless, and can accumulate rapidly in cockpits and enclosed spaces with no warning", "CO poisoning only occurs at high engine RPM", "Modern vessels have sufficient ventilation to prevent CO accumulation"],
    correct: 1,
    explanation: "CO is a silent killer on vessels. No color, no odor. Symptoms mimic seasickness. Exhaust gases can accumulate at the swim platform, in cockpits with limited airflow, and below decks. Install CO detectors, ventilate thoroughly, and never run a generator with people in the cockpit or swim area."
  },
  {
    id: 76,
    category: "Safety",
    difficulty: "advanced",
    question: "What does it mean when a vessel's stability curve shows the 'vanishing stability point'?",
    options: ["A graph of speed vs fuel consumption; vanishing stability is maximum efficient speed", "The angle of heel at which the vessel will no longer self-right — it will capsize", "The angle at which cargo shifts", "The point where the keel stops providing righting moment"],
    correct: 1,
    explanation: "The stability curve plots righting moment against angle of heel. The vanishing stability point is where the curve crosses zero — the vessel will capsize rather than right itself beyond this angle. Overloading, improper weight placement, and free surface effect all reduce stability. Know your vessel's limits before offshore passages."
  },
  {
    id: 77,
    category: "Safety",
    difficulty: "beginner",
    question: "Where should flares be stored on a vessel?",
    options: ["In the bilge for protection from heat", "In a waterproof container that is readily accessible in an emergency", "Locked in the cabin for security", "Stored with the life raft equipment only"],
    correct: 1,
    explanation: "Flares must be readily accessible — in the cockpit, grab bag, or dedicated flare box. A flare stored in a locker you can't reach while sinking is useless. Also check expiration dates — flares expire (typically 42 months). Carry spares."
  },
  {
    id: 78,
    category: "Safety",
    difficulty: "intermediate",
    question: "How often should fire extinguishers on a vessel be inspected?",
    options: ["Every 5 years only — they are sealed units", "Annually, and replaced or recharged per manufacturer's instructions when necessary", "Only after use", "Monthly — check pressure gauge and shake to prevent powder compaction"],
    correct: 1,
    explanation: "Annual inspection is required. Check the gauge (should be in the green zone), the tamper seal, and for damage or corrosion. Dry chemical extinguishers should be inverted and shaken annually to prevent powder compaction. On a boat, where your extinguisher is your only defense, don't neglect this."
  },

  // ===== WEATHER =====
  {
    id: 79,
    category: "Weather",
    difficulty: "beginner",
    question: "A rapidly falling barometer indicates:",
    options: ["Improving weather", "Approaching storm or deteriorating conditions", "A shift from west to east winds", "High pressure building"],
    correct: 1,
    explanation: "A falling barometer means low pressure is approaching — wind and deteriorating weather. A rapid fall (more than 0.1 inches per hour) is a serious warning. 'Long foretold, long last; short notice, soon past.' A rapid drop means a fast-moving, often intense system. Get to shelter or prepare the vessel."
  },
  {
    id: 80,
    category: "Weather",
    difficulty: "beginner",
    question: "In the Northern Hemisphere, when you stand with the wind at your back, low pressure is to your:",
    options: ["Right", "Left", "Directly ahead", "Behind you"],
    correct: 1,
    explanation: "Buys Ballot's Law — stand with the wind at your back in the Northern Hemisphere, and low pressure is to your left. Wind circulates counterclockwise around lows in the Northern Hemisphere. This simple trick can help you figure out where the bad weather is even without instruments."
  },
  {
    id: 81,
    category: "Weather",
    difficulty: "intermediate",
    question: "What is the dangerous semicircle of a tropical cyclone in the Northern Hemisphere?",
    options: ["The left semicircle — where cyclonic winds are strongest", "The right semicircle — where the storm's forward motion adds to the cyclonic winds", "The front quadrant — where the storm arrives first", "The rear quadrant — where tornadoes are most common"],
    correct: 1,
    explanation: "The right semicircle is where the storm's forward movement adds to the cyclonic wind speed, producing the highest sustained winds and most dangerous seas. In the Northern Hemisphere, this is the right side looking in the direction of travel. Avoid it by putting the storm's center on your port bow and running."
  },
  {
    id: 82,
    category: "Weather",
    difficulty: "intermediate",
    question: "What weather pattern typically follows a cold front passage in the Northern Hemisphere?",
    options: ["Warm, humid air with increasing clouds", "Clearing skies, wind shift to northwest, dropping temperatures", "Steady rain and fog for 12-24 hours", "Calm conditions with a backing wind"],
    correct: 1,
    explanation: "Classic cold front passage: the line of thunderstorms passes, wind shifts clockwise (veers) to the northwest, skies clear, temperatures drop, visibility improves dramatically. That post-frontal northwest wind can build fast — reef early rather than wait for conditions to deteriorate."
  },
  {
    id: 83,
    category: "Weather",
    difficulty: "intermediate",
    question: "What do cumulonimbus clouds indicate?",
    options: ["Fair weather ahead", "Light rain and drizzle for several hours", "Thunderstorm activity with potential for severe squalls, hail, and waterspouts", "Fog developing overnight"],
    correct: 2,
    explanation: "Cumulonimbus — the thunderhead — means business. Rapid vertical development, anvil top, dark base. These cells can generate 60-knot winds at their base, hail, waterspouts, and lightning. Give them at least 20 miles of sea room if you can. A lightning strike on a mast can destroy your navigation electronics instantly."
  },
  {
    id: 84,
    category: "Weather",
    difficulty: "beginner",
    question: "The Beaufort Scale measures:",
    options: ["Wave height in meters", "Wind speed and its observed effects on sea and land", "Barometric pressure", "Rainfall intensity"],
    correct: 1,
    explanation: "The Beaufort Scale (0-12) describes wind speed in terms of observable effects. Force 0 is calm, Force 6 is a strong breeze with whitecaps everywhere, Force 10 is a storm. Even without instruments, you can estimate wind force by observing the sea state. A centuries-old practical tool that still works."
  },
  {
    id: 85,
    category: "Weather",
    difficulty: "advanced",
    question: "What is the 'rule of twelfths' used for in seamanship?",
    options: ["Calculating compass error at 12 different headings", "Estimating tidal height at any point in the tidal cycle", "Determining fuel consumption at different engine speeds", "Calculating scope requirements"],
    correct: 1,
    explanation: "The rule of twelfths approximates tidal rise/fall. In a 6-hour tidal cycle: 1/12 in hour 1, 2/12 in hour 2, 3/12 in hour 3, 3/12 in hour 4, 2/12 in hour 5, 1/12 in hour 6. The middle two hours have the fastest tidal flow. Useful for estimating depth over a bar at any point in the tide — no tables required."
  },
  {
    id: 86,
    category: "Weather",
    difficulty: "intermediate",
    question: "Sea fog most commonly forms when:",
    options: ["A cold air mass moves over warm water", "Warm, moist air moves over cold water", "High pressure builds rapidly overnight", "Strong winds mix surface air with cold deep water"],
    correct: 1,
    explanation: "Sea fog (advection fog) forms when warm, moist air moves over cold water. The water cools the air to its dew point, and condensation forms. Common on the California coast, the Grand Banks, and anywhere warm air flows over cold currents. It can form rapidly and be extremely dense."
  },
  {
    id: 87,
    category: "Weather",
    difficulty: "intermediate",
    question: "What does a steady rise in barometric pressure typically indicate?",
    options: ["Deteriorating weather approaching", "Improving weather and clearing conditions", "An imminent thunderstorm", "The approach of a warm front"],
    correct: 1,
    explanation: "A rising barometer means high pressure is building — typically clearing skies, diminishing winds, and improving conditions. A slow, steady rise usually precedes several days of good weather. A rapid rise after a storm can bring gusty northwest winds as the high builds behind a departing low."
  },
  {
    id: 88,
    category: "Weather",
    difficulty: "advanced",
    question: "What is a 'katabatic wind' and when is it dangerous to mariners?",
    options: ["A wind that develops at sea due to pressure gradient — dangerous in all conditions", "A gravity-driven wind that flows downslope from high terrain — can create sudden violent gusts near mountainous coastlines", "A warm wind that develops over tropical water — dangerous in summer", "A rotating wind associated with tropical storms"],
    correct: 1,
    explanation: "Katabatic winds flow downslope under gravity when cold, dense air drains off high terrain. Near mountainous coastlines — Norway, Alaska, Patagonia — they can accelerate to 60+ knots with little warning, even in otherwise calm conditions. Always check for katabatic wind risk when anchoring near steep terrain. The anchorage that looks protected can become a trap."
  },

  // ===== REGULATIONS =====
  {
    id: 89,
    category: "Regulations",
    difficulty: "intermediate",
    question: "What is the minimum age to receive a USCG Merchant Mariner Credential (captain's license)?",
    options: ["16 years old", "18 years old", "21 years old", "25 years old"],
    correct: 1,
    explanation: "18 years old is the minimum age for a USCG Merchant Mariner Credential. You also need 360 days of underway experience (for OUPV near coastal), a physical exam, drug test, background check, and passing scores on the USCG examination. Time on the water is non-negotiable — it builds the judgment that a license tests."
  },
  {
    id: 90,
    category: "Regulations",
    difficulty: "intermediate",
    question: "Required safety equipment for a vessel 16-26 feet in length includes:",
    options: ["1 Type IV PFD only", "1 wearable PFD per person, 1 Type IV throwable, 1 B-I fire extinguisher, visual distress signals, sound signal", "2 wearable PFDs, flares, fire extinguisher, and radio", "1 wearable PFD per person and one fire extinguisher only"],
    correct: 1,
    explanation: "For vessels 16-26 feet: one wearable PFD per person (Type I/II/III), one Type IV throwable device, at least one B-I fire extinguisher, visual distress signals (offshore), and an effective sound-producing device. Know this cold — a Coast Guard boarding will test every item."
  },
  {
    id: 91,
    category: "Regulations",
    difficulty: "intermediate",
    question: "What is the blood alcohol concentration (BAC) limit for federal BUI (Boating Under the Influence)?",
    options: ["0.10%", "0.08%", "0.06%", "0.04%"],
    correct: 1,
    explanation: "0.08% BAC — same as driving a car. Federal BUI law (33 USC 1232) prohibits operating a vessel with 0.08% BAC or higher. As a licensed captain carrying passengers, you're held to an even higher standard. If you're drinking, you're not at the helm. Period."
  },
  {
    id: 92,
    category: "Regulations",
    difficulty: "advanced",
    question: "Under the OUPV (6-pack) license, what is the maximum number of passengers you may carry for hire?",
    options: ["6 passengers", "8 passengers", "10 passengers", "12 passengers"],
    correct: 0,
    explanation: "An OUPV (Operator of Uninspected Passenger Vessels) license limits you to 6 paying passengers. That's why it's called the '6-pack' license. To carry more, you need a Master's license and a USCG-inspected vessel. Exceed the 6-passenger limit and you're operating illegally with void insurance."
  },
  {
    id: 93,
    category: "Regulations",
    difficulty: "intermediate",
    question: "How far must you stay from a US Navy vessel?",
    options: ["100 yards", "500 yards", "1000 yards", "1 nautical mile"],
    correct: 1,
    explanation: "500 yards minimum from Navy vessels. Within 100 yards you must operate at minimum speed. This is federal law under Maritime Security regulations post-9/11. Violation can result in armed response. If you see a small boat with armed personnel approaching, comply immediately."
  },
  {
    id: 94,
    category: "Regulations",
    difficulty: "intermediate",
    question: "What must you do when involved in a boating accident resulting in death or injury requiring medical treatment?",
    options: ["File a report within 30 days", "Report immediately to the nearest law enforcement authority", "Report within 48 hours if there is injury, 10 days for property damage only", "No report required in international waters"],
    correct: 1,
    explanation: "Federal and state law require immediate notification of the nearest law enforcement authority when there's a death, injury requiring medical treatment beyond first aid, or disappearance. A written report is required within 48 hours for death or disappearance, 10 days for injury or property damage over $2,000."
  },
  {
    id: 95,
    category: "Regulations",
    difficulty: "intermediate",
    question: "On all inland waters and in designated No-Discharge Zones (NDZs), what sewage discharge is permitted?",
    options: ["No sewage may be discharged regardless of treatment level", "Treated sewage from a Type I MSD is permitted", "Treated sewage from any MSD is permitted", "Raw sewage may be discharged if underway"],
    correct: 0,
    explanation: "On all inland waters and in designated NDZs, no sewage may be discharged regardless of treatment level. On coastal waters beyond NDZs, treated sewage from a Type I or II MSD may be discharged. Raw sewage may only be discharged more than 3 nautical miles offshore. Check with harbor masters for local NDZ boundaries."
  },
  {
    id: 96,
    category: "Regulations",
    difficulty: "beginner",
    question: "What must be displayed on the hull of every registered recreational vessel in the US?",
    options: ["Only the state registration numbers", "The state registration numbers and validation sticker, properly sized and placed", "Vessel name and home port only", "USCG documentation number only"],
    correct: 1,
    explanation: "Registration numbers must be displayed on the bow in plain sight, in letters at least 3 inches high. The validation sticker goes within 6 inches of the number. Letters must contrast with the hull color and be block-style. Federally documented vessels are exempt from state numbers but must display the documentation number inside the hull."
  },
  {
    id: 97,
    category: "Regulations",
    difficulty: "advanced",
    question: "Under MARPOL Annex I, where is it prohibited to discharge oil or oily mixtures?",
    options: ["Only within 3 nautical miles of land", "Within 12 nautical miles of land, and in special areas where discharge is totally prohibited", "Only in harbors and marinas", "There is no prohibition — only reporting requirements"],
    correct: 1,
    explanation: "MARPOL Annex I prohibits oily discharges within 12 nautical miles of the nearest land. In special areas like the Mediterranean, Baltic, and Antarctic, discharge is totally prohibited. Beyond 12 miles, filtered discharges (less than 15 ppm) are permitted only when underway. Use an oil water separator, not overboard discharge."
  },
  {
    id: 98,
    category: "Regulations",
    difficulty: "intermediate",
    question: "What is required before discharging treated sewage from an MSD in US coastal waters?",
    options: ["No restrictions apply outside territorial seas", "Vessel must be underway, beyond 3 nautical miles, using a properly operating Type I or II MSD", "A federal permit is required", "Discharge is permitted at anchor beyond 1 mile"],
    correct: 1,
    explanation: "Outside NDZs on coastal waters, discharge from a Type I or II MSD requires that the vessel be underway and the device be properly operating. Type III holding tanks must be pumped at a marina pump-out station. Know the regulations for each body of water you operate in."
  },

  // ===== DECK GENERAL / STABILITY =====
  {
    id: 99,
    category: "Deck General",
    difficulty: "intermediate",
    question: "What is 'freeboard'?",
    options: ["The distance from the waterline to the deck edge", "The amount of cargo capacity remaining", "The height of the mast above the waterline", "The free space in the bilge"],
    correct: 0,
    explanation: "Freeboard is the vertical distance from the waterline to the upper deck edge. It's your reserve buoyancy — the amount of hull left above water. Low freeboard means less stability reserve and easier water ingress. Load your vessel within limits, maintain freeboard, and the sea has a harder time getting aboard."
  },
  {
    id: 100,
    category: "Deck General",
    difficulty: "intermediate",
    question: "What does 'metacentric height' (GM) indicate?",
    options: ["The height of the mast from the keel", "The distance between the center of gravity and metacenter — indicates initial stability", "The depth of the keel below the waterline", "The height of the center of buoyancy"],
    correct: 1,
    explanation: "GM (metacentric height) is the distance between the center of gravity (G) and the metacenter (M). A large positive GM means high initial stability — the vessel is stiff. A small GM means tender behavior. A negative GM means the vessel is unstable and will capsize. Load high and you raise G, reducing GM. Keep heavy gear low."
  },
  {
    id: 101,
    category: "Deck General",
    difficulty: "intermediate",
    question: "What is 'free surface effect' and why is it dangerous?",
    options: ["Wind pressure on exposed deck surfaces causing heeling", "The movement of liquids in partially filled tanks that reduces effective stability", "The drag effect of water flowing along a smooth hull", "The tendency of a vessel to trim by the head when moving"],
    correct: 1,
    explanation: "Free surface effect occurs when a liquid in a partially filled tank moves as the vessel heels, shifting the virtual center of gravity upward and reducing stability. A half-full fuel tank has more free surface effect than a full or empty one. Keep tanks full or empty when possible offshore."
  },
  {
    id: 102,
    category: "Deck General",
    difficulty: "beginner",
    question: "What does 'trim' refer to on a vessel?",
    options: ["The difference in draft between the bow and stern", "The athwartships (sideways) lean of the vessel", "The angle of the mast from vertical", "The amount of drag on the keel"],
    correct: 0,
    explanation: "Trim is the longitudinal balance — the difference in draft between bow and stern. A vessel trimmed by the stern (deeper aft) is said to have a stern trim. Load distribution directly affects trim — and trim affects speed, fuel consumption, and seakeeping."
  },
  {
    id: 103,
    category: "Deck General",
    difficulty: "advanced",
    question: "What is the 'angle of loll' and how does it differ from a stable list?",
    options: ["They are the same — both describe a vessel heeling to one side", "Angle of loll is an unstable equilibrium from a negative GM — can flop to either side; a list is a permanent heel from weight imbalance", "Angle of loll occurs in heavy weather; a list occurs at anchor", "Angle of loll is caused by wind; a list is caused by off-center loading"],
    correct: 1,
    explanation: "A list is caused by off-center weight — fix it by moving weight. An angle of loll is caused by a negative or zero GM — the vessel is unstable upright and falls to one side. The fix is NOT to move weight to windward (which can cause sudden capsize to the other side) — the fix is to lower G by adding ballast low or reducing topside weight. Misdiagnosis can sink a ship."
  },
  {
    id: 104,
    category: "Deck General",
    difficulty: "beginner",
    question: "What should you do before fueling a powerboat?",
    options: ["Start the engine to confirm it will restart afterward", "Close all hatches and ports, shut off engine and all ignition sources, put passengers ashore", "Connect shore power to maintain battery charge during fueling", "Test the bilge blower to clear any gas fumes before fueling begins"],
    correct: 1,
    explanation: "Before fueling: close hatches, ports, and doors. Shut off the engine, stove, and ALL ignition sources including electronics. Put passengers ashore. After fueling, open hatches and run the bilge blower for at least 4 minutes before starting the engine. Gasoline vapors are heavier than air — they sink into the bilge and one spark creates an explosion."
  },
  {
    id: 105,
    category: "Deck General",
    difficulty: "intermediate",
    question: "What is the purpose of running the blower before starting a gasoline engine?",
    options: ["To cool the engine compartment before starting", "To purge fuel vapors from the bilge and engine compartment", "To check that the exhaust system is clear", "To pressurize the fuel system"],
    correct: 1,
    explanation: "The blower exhausts the engine compartment and bilge, removing accumulated fuel vapors before you create an ignition source. Run it for at least 4 minutes after fueling and before start — sniff the engine compartment too. If you smell gas, keep running the blower and find the source before you start."
  },
  {
    id: 106,
    category: "Deck General",
    difficulty: "intermediate",
    question: "What does 'displacement' mean in reference to a vessel?",
    options: ["How far the vessel has traveled from its home port", "The weight of water displaced by the vessel, equal to the vessel's total weight", "The speed at which the vessel becomes uncomfortable in a seaway", "The volume of the engine room and machinery spaces"],
    correct: 1,
    explanation: "By Archimedes' principle, a floating vessel displaces a volume of water equal in weight to the vessel itself. Displacement determines hull speed for displacement vessels (approx. 1.34 x √waterline length in feet = hull speed in knots). Overloading increases displacement, increases draft, and reduces freeboard — all bad outcomes."
  },
  {
    id: 107,
    category: "Deck General",
    difficulty: "intermediate",
    question: "What is 'watertight subdivision' and why is it important?",
    options: ["The separation of freshwater and saltwater tanks", "Bulkheads that divide the vessel into compartments that can be sealed to limit flooding", "The fiberglass layup schedule that determines hull thickness", "The separation of engine room from living quarters for fire safety"],
    correct: 1,
    explanation: "Watertight bulkheads divide the vessel into sealed compartments. If one compartment floods, watertight subdivision can prevent the flooding from spreading and sinking the vessel. Even partial watertight subdivision significantly improves survivability for small craft."
  },

  // ===== FIRST AID =====
  {
    id: 108,
    category: "First Aid",
    difficulty: "beginner",
    question: "What is the universal sign of choking in an adult?",
    options: ["Coughing violently", "Clutching the throat with both hands", "Turning red in the face", "Inability to speak at all"],
    correct: 1,
    explanation: "The universal choking sign is clutching the throat with one or both hands. Ask 'are you choking?' A person who can cough or speak is moving air — encourage them to keep coughing. A person who cannot cough, speak, or breathe needs immediate abdominal thrusts (Heimlich maneuver). You may be the only medical help available offshore."
  },
  {
    id: 109,
    category: "First Aid",
    difficulty: "beginner",
    question: "What are the signs of hypothermia?",
    options: ["High temperature, rapid pulse, flushed skin", "Shivering, confusion, slurred speech, loss of coordination, slow pulse", "Nausea, vomiting, and abdominal pain", "Sweating, thirst, and muscle cramps"],
    correct: 1,
    explanation: "Hypothermia signs: shivering (stops in severe cases — a bad sign), confusion, slurred speech, loss of coordination, slow weak pulse. Treatment: remove from cold, insulate, gentle rewarming — no vigorous rubbing, no alcohol, no hot liquids if unconscious. Offshore, hypothermia is one of your most likely medical emergencies."
  },
  {
    id: 110,
    category: "First Aid",
    difficulty: "intermediate",
    question: "How should you treat severe bleeding from a wound?",
    options: ["Apply ice to slow blood flow", "Apply direct pressure with a clean cloth and maintain it", "Use a tourniquet immediately for any wound", "Elevate the limb only — pressure may worsen the wound"],
    correct: 1,
    explanation: "Direct pressure is the first-line treatment for severe bleeding. Apply a clean cloth, apply firm pressure, and hold it — don't keep lifting it to check. If the cloth soaks through, add more on top. Tourniquets are for life-threatening limb hemorrhage when direct pressure fails. Offshore, controlling bleeding is a skill that can save a life."
  },
  {
    id: 111,
    category: "First Aid",
    difficulty: "intermediate",
    question: "What is the treatment for heat stroke (not heat exhaustion)?",
    options: ["Give fluids and move to shade", "Immediate aggressive cooling — move to shade, cool with water, fan, seek medical help urgently", "Have the person lie flat and apply warm compresses", "Give aspirin and monitor for 1 hour"],
    correct: 1,
    explanation: "Heat stroke is a medical emergency — the body's temperature regulation has failed. Immediate aggressive cooling is critical: move to shade, remove clothing, pour cool water over the body, fan vigorously, apply ice packs to neck, armpits, and groin. Call for emergency help. Heat stroke kills — don't wait to see if they 'feel better.'"
  },
  {
    id: 112,
    category: "First Aid",
    difficulty: "intermediate",
    question: "What are the signs of a heart attack?",
    options: ["Sudden headache and vision changes only", "Chest pain or pressure radiating to arm or jaw, shortness of breath, sweating, nausea", "High fever and confusion", "Rapid pulse and hyperventilation only"],
    correct: 1,
    explanation: "Heart attack signs: chest pain or pressure (may radiate to left arm, jaw, or back), shortness of breath, sweating, nausea, lightheadedness. Some heart attacks present with only mild discomfort or jaw pain — don't dismiss it. Offshore, radio for help immediately, give aspirin if not allergic, and be prepared to perform CPR."
  },
  {
    id: 113,
    category: "First Aid",
    difficulty: "beginner",
    question: "When should you call MAYDAY for a medical emergency?",
    options: ["Only when the patient is unconscious", "When someone has a life-threatening condition and you cannot reach medical help any other way", "Only for broken bones or lacerations", "Only when more than 50 miles offshore"],
    correct: 1,
    explanation: "Call MAYDAY or PAN-PAN for any life-threatening medical emergency when you cannot provide adequate care or reach medical help quickly. The Coast Guard can connect you to medical advice via radio and coordinate evacuation. Don't hesitate to call — a false alarm costs the Coast Guard time, but a delayed call can cost a life."
  },

  // ===== ADDITIONAL MIXED =====
  {
    id: 114,
    category: "Navigation",
    difficulty: "intermediate",
    question: "What does a flashing red light on a lateral buoy indicate?",
    options: ["Danger — stay away", "Port side of the channel (returning from sea)", "Starboard side of the channel (returning from sea)", "Isolated danger mark"],
    correct: 1,
    explanation: "Red flashing or occulting lights are on red buoys marking the port side of the channel returning from sea — meaning you leave them to starboard when heading out. Remember: Red Right Returning. The light characteristic helps you identify buoys at a distance and in poor visibility."
  },
  {
    id: 115,
    category: "Seamanship",
    difficulty: "intermediate",
    question: "What is the purpose of the bilge pump on a vessel?",
    options: ["To pump fresh water to the galley", "To remove water that accumulates in the bilge from leaks, condensation, or wave action", "To create suction for the anchor windlass", "To circulate engine cooling water"],
    correct: 1,
    explanation: "The bilge pump removes water from the lowest part of the hull. An automatic bilge pump is convenient, but it can hide a developing leak. Check your bilge manually before departure and every watch offshore. If the bilge pump is running continuously, you have a problem that needs immediate attention."
  },
  {
    id: 116,
    category: "COLREGS",
    difficulty: "advanced",
    question: "How does the COLREGS definition of 'vessel' affect rule application?",
    options: ["Only motorized vessels are subject to COLREGS", "Every watercraft including seaplanes on the water and WIG craft are subject to COLREGS", "COLREGS applies to vessels over 20 meters only", "Only documented vessels are subject to COLREGS"],
    correct: 1,
    explanation: "Rule 3 defines 'vessel' broadly — every type of watercraft from a kayak to a supertanker, and including seaplanes on the water and WIG (wing-in-ground effect) craft. COLREGS apply to ALL vessels. Your kayak has COLREGS obligations. Your paddleboard has COLREGS obligations. There are no size exemptions."
  },
  {
    id: 117,
    category: "Regulations",
    difficulty: "advanced",
    question: "What does the Load Line (Plimsoll mark) indicate?",
    options: ["The maximum speed rating for the vessel class", "The maximum draft to which a vessel may be loaded, varying by season and ocean zone", "The minimum freeboard required for the vessel's length", "The weight of cargo required to achieve rated stability"],
    correct: 1,
    explanation: "The Plimsoll line shows the maximum safe loading depth under various conditions — summer, winter, tropical, fresh water. A vessel loaded below the applicable load line is dangerously overloaded. Required on vessels of 150 GRT or more in international voyages. The system has saved thousands of lives by preventing overloading."
  },
  {
    id: 118,
    category: "Navigation",
    difficulty: "advanced",
    question: "What is 'compass swing' and when should it be performed?",
    options: ["A visual check of compass operation before each voyage", "A procedure to determine and record compass deviation on multiple headings", "Annual recalibration of the compass by removing magnetic material", "A test to verify compass accuracy against GPS heading"],
    correct: 1,
    explanation: "Swinging the compass means rotating the vessel through 360 degrees on all cardinal and intercardinal headings to measure deviation on each heading. Results are recorded on a deviation card mounted near the compass. Swing the compass after installing new equipment, after a lightning strike, or if you suspect compass error."
  },
  {
    id: 119,
    category: "Seamanship",
    difficulty: "intermediate",
    question: "What is the correct way to use an anchor when docking in strong current?",
    options: ["Never use an anchor when docking — it creates a hazard", "Drop the anchor to windward or up-current, then veer scope as you approach the dock", "Back in against the current to maintain control", "Anchor 100 meters off the dock and wait for current to ease"],
    correct: 1,
    explanation: "In a strong current, drop the anchor upwind or up-current of your intended berth, then veer (pay out) scope as the current carries you toward the dock. The anchor controls your approach speed and keeps the bow pointed into the current. It's a technique every coastal mariner needs in their toolkit."
  },
  {
    id: 120,
    category: "Weather",
    difficulty: "intermediate",
    question: "What does a 'veering' wind mean and what does it often indicate?",
    options: ["A wind that decreases in speed — usually indicates calm weather approaching", "A wind that shifts in a clockwise direction — often indicates a cold front approaching or passing", "A wind that increases in speed — indicates a squall approaching", "A wind that shifts counterclockwise — indicates a warm front passage"],
    correct: 1,
    explanation: "A veering wind shifts clockwise (e.g., SW to W to NW). In the Northern Hemisphere, a veer is often associated with cold front passage or high pressure building. A backing wind (counterclockwise shift) may indicate a warm front or deteriorating conditions. Tracking wind direction changes is one of the most valuable weather-watching tools available to any sailor."
  }
];

const { CosmosClient } = require('@azure/cosmos');
const cosmosClient = new CosmosClient(process.env.COSMOS_CONNECTION_STRING);
const progressContainer = cosmosClient.database('marineiq').container('progress');

module.exports = async function (context, req) {
    context.log('Quiz function called');

    const action = req.body && req.body.action;

    if (action === 'get') {
        const category = req.body.category || null;
        const difficulty = req.body.difficulty || null;
        const count = req.body.count || 5;

        let filtered = QUESTIONS;
        if (category) filtered = filtered.filter(q => q.category === category);
        if (difficulty) filtered = filtered.filter(q => q.difficulty === difficulty);

        const shuffled = filtered.sort(() => Math.random() - 0.5).slice(0, count);
        const stripped = shuffled.map(({ correct, explanation, ...q }) => q);

        context.res = {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
            body: { questions: stripped, total: filtered.length }
        };
        return;
    }

    if (action === 'grade') {
        const questionId = req.body.questionId;
        const selectedAnswer = req.body.selectedAnswer;

        const question = QUESTIONS.find(q => q.id === questionId);
        if (!question) {
            context.res = { status: 404, body: { error: 'Question not found' } };
            return;
        }

        const correct = selectedAnswer === question.correct;

        context.res = {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
            body: {
                correct,
                correctAnswer: question.correct,
                explanation: question.explanation,
                category: question.category
            }
        };
        return;
    }

    if (action === 'saveProgress') {
        const { userId, score, total, categories } = req.body;
        if (!userId) {
            context.res = { status: 400, body: { error: 'userId is required' } };
            return;
        }
        const record = {
            id: `progress-${Date.now()}`,
            userId,
            date: new Date().toISOString(),
            score,
            total,
            percentage: Math.round((score / total) * 100),
            categories: categories || {}
        };
        await progressContainer.items.create(record);
        context.res = { status: 201, headers: { 'Content-Type': 'application/json' }, body: { success: true } };
        return;
    }

    if (action === 'getProgress') {
        const { userId } = req.body;
        if (!userId) {
            context.res = { status: 400, body: { error: 'userId is required' } };
            return;
        }
        const { resources } = await progressContainer.items.query({
            query: 'SELECT * FROM c WHERE c.userId = @userId ORDER BY c.date DESC',
            parameters: [{ name: '@userId', value: userId }]
        }).fetchAll();

        // Aggregate category performance across all sessions
        const categoryTotals = {};
        for (const r of resources) {
            for (const [cat, stats] of Object.entries(r.categories || {})) {
                if (!categoryTotals[cat]) categoryTotals[cat] = { correct: 0, total: 0 };
                categoryTotals[cat].correct += stats.correct;
                categoryTotals[cat].total += stats.total;
            }
        }

        context.res = {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
            body: { sessions: resources, categoryTotals }
        };
        return;
    }

    context.res = {
        status: 400,
        body: { error: 'action must be get, grade, saveProgress, or getProgress' }
    };
};
