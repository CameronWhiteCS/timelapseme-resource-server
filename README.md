# TimeLapseMe Resource Server

Stores user-uploaded images and processes them into video on-demand.

# API

## Misc. Details

- All errors are plain text
- All dates and times are recorded using Greenwich Mean Time

## Environment Variables (.env)

PORT

MYSQL_USER
MYSQL_PASSWORD
MYSQL_HOST
MYSQL_PORT
MYSQL_DATABASE

JWT_PUBLIC_KEY_PATH
JWT_ISSUER - Expected issuer of auth JWT's
JWT_AUDIENCE - Expected audience of auth JWT's

UPLOAD_DIRECTORY
TIMELAPSE_DIRECTORY
MAX_UPLOAD_SIZE - Size in bytes

## API Tree

```
/api
    /api/v1/
        POST /api/v1/images
        GET /api/v1/images/:id
        GET /api/v1/images/user/:userId/page/:page
        GET /api/v1/timelapses
```

### POST /api/v1/images

Allows client to upload a single image at a time.

**Request**: 
Content-Type: multipart/form-data
Field nane: image
Value: Selfie to be uploaded.

**Response**
200 'OK' OR error.

### GET /api/v1/images/:id

Look up an image using its numeric ID.

**Response**: 

Content-Type is variable but is typically either image/png or iamge/jpeg

### DELETE /api/v1/images/:id

Assuming the user owns the image, it is deleted.

Response: 200 'OK' OR error

### GET /api/v1/images/user/:userId/page/:page

**Requires authentication**

Returns an array of Image ID's belonging to the specified user with the most recently uploaded images listed first.

Supports two query parameters: 'after' and 'before'. Both measured in ms since Unix epoch. Server-side, these will be converted into dates and only the appropriate image id's will be returned.

Example:

/api/v1/images/user/:userId/page/:page?after=1000000&before=2000000

**Response**:
```json
    [1, 5, 8, 21, 312]
```

### GET /api/v1/timelapses

Generates a timelapse using all of a user's uploaded photos and then returns it to the client as an mp4

**Response**:
Content-Type: video/mp4