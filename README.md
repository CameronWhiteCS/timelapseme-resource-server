# TimeLapseMe Resource Server

Stores user-uploaded images and processes them into video on-demand.

# API

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

### GET /api/v1/images/user/:userId/page/:page

Returns an array of Image ID's

**Response**:
```json
    [1, 5, 8, 21, 312]
```