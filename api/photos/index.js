const { BlobServiceClient, generateBlobSASQueryParameters, BlobSASPermissions, StorageSharedKeyCredential } = require('@azure/storage-blob')

const CONTAINER = 'photos'
const ACCOUNT_NAME = 'stmarineiqprod'

function getCredential() {
  const connStr = process.env.STORAGE_CONNECTION_STRING
  const match = connStr.match(/AccountKey=([^;]+)/)
  if (!match) throw new Error('Could not parse storage account key')
  return new StorageSharedKeyCredential(ACCOUNT_NAME, match[1])
}

module.exports = async function (context, req) {
  context.log('Photos function called')

  const action = req.body && req.body.action
  const userId = req.body && req.body.userId

  if (!userId) {
    context.res = { status: 400, body: { error: 'userId is required' } }
    return
  }

  try {
    if (action === 'getUploadUrl') {
      const { filename, contentType } = req.body
      if (!filename || !contentType) {
        context.res = { status: 400, body: { error: 'filename and contentType are required' } }
        return
      }

      const ext = filename.split('.').pop().toLowerCase()
      const blobName = `${userId}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`

      const credential = getCredential()
      const expiresOn = new Date(Date.now() + 5 * 60 * 1000) // 5 minutes

      const sasToken = generateBlobSASQueryParameters({
        containerName: CONTAINER,
        blobName,
        permissions: BlobSASPermissions.parse('cw'),
        expiresOn,
        contentType
      }, credential).toString()

      const uploadUrl = `https://${ACCOUNT_NAME}.blob.core.windows.net/${CONTAINER}/${blobName}?${sasToken}`
      const publicUrl = `https://${ACCOUNT_NAME}.blob.core.windows.net/${CONTAINER}/${blobName}`

      context.res = { status: 200, body: { uploadUrl, publicUrl, blobName } }
      return
    }

    if (action === 'deletePhoto') {
      const { blobName } = req.body
      if (!blobName) {
        context.res = { status: 400, body: { error: 'blobName is required' } }
        return
      }

      // Ensure users can only delete their own photos
      if (!blobName.startsWith(`${userId}/`)) {
        context.res = { status: 403, body: { error: 'Forbidden' } }
        return
      }

      const blobServiceClient = BlobServiceClient.fromConnectionString(process.env.STORAGE_CONNECTION_STRING)
      const containerClient = blobServiceClient.getContainerClient(CONTAINER)
      await containerClient.getBlobClient(blobName).deleteIfExists()

      context.res = { status: 200, body: { success: true } }
      return
    }

    context.res = { status: 400, body: { error: 'action must be getUploadUrl or deletePhoto' } }

  } catch (err) {
    context.log.error('Photos error:', err.message)
    context.res = { status: 500, body: { error: err.message } }
  }
}
