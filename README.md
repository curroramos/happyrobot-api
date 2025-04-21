# HappyRobot Load Checker API

This project implements a REST API for the HappyRobot carrier sales use case. It allows an AI assistant to verify carrier credentials and retrieve load information based on a reference number from a CSV file.

## Features

- **CSV Query Optimization**: Uses streaming with `stream.destroy()` to stop reading after the first match, avoiding memory overhead.
- **Carrier Validation**: Uses the FMCSA API to validate MC numbers.
- **API Security**: Secured with a basic API key system.
- **Dockerized**: Easily build and run using Docker.
- **Deployed**: Accessible at [https://happyrobot-api.onrender.com](https://happyrobot-api.onrender.com)


## Endpoints

### Authentication

All endpoints require an API key to be included in the request headers.

**Header Format:**
```
x-api-key: your-api-key-here
```

### `GET /loads`

Retrieve load details by reference number.

**Query Parameters:**
- `reference_number` (required): The unique identifier for the load.

**Example Request:**
```
GET /loads?reference_number=REF09460
```

**cURL Example:**
```bash
curl -X GET "https://happyrobot-api.onrender.com/loads?reference_number=REF09460" \
  -H "x-api-key: your-api-key-here"
```

**Success Response:**
```json
{
  "reference_number": "REF09460",
  "origin": "Denver, CO",
  "destination": "Detroit, MI",
  "equipment_type": "Dry Van",
  "rate": "868",
  "commodity": "Automotive Parts"
}
```

**Error Responses:**
- `400 Bad Request`: Missing reference number.
- `404 Not Found`: Reference number not found.

---

### `GET /loads/search`

Search for loads by origin, destination, and/or trailer type.

**Query Parameters (at least one required):**
- `origin`: Load origin location (e.g., "Dallas, TX")
- `destination`: Load destination location (e.g., "Chicago, IL")
- `trailer_type`: Equipment type (e.g., "Dry Van")

**Example Request:**
```
GET /loads/search?origin=Dallas, TX&trailer_type=Flatbed
```

**cURL Example:**
```bash
curl -X GET "https://happyrobot-api.onrender.com/loads/search?origin=Dallas, TX&trailer_type=Flatbed" \
  -H "x-api-key: your-api-key-here"
```

**Success Response:**
```json
[
  {
    "reference_number": "REF04684",
    "origin": "Dallas, TX",
    "destination": "Chicago, IL",
    "equipment_type": "Dry Van or Flatbed",
    "rate": "570",
    "commodity": "Agricultural Products"
  }
]
```

**Error Response:**
- `400 Bad Request`: No valid query parameters provided.

---

### `GET /verify`

Validate a carrier's MC number using the FMCSA API.

**Query Parameters:**
- `mc_number` (required): Carrier's MC number.

**Example Request:**
```
GET /verify?mc_number=123456
```

**cURL Example:**
```bash
curl -X GET "https://happyrobot-api.onrender.com/verify?mc_number=123456" \
  -H "x-api-key: your-api-key-here"
```

**Success Response:**
```json
{
  "legal_name": "Carrier Name Inc.",
  "dba_name": "Carrier DBA",
  "status": "Active",
  "mc_number": "123456"
}
```

**Error Responses:**
- `400 Bad Request`: Missing MC number.
- `500 Internal Server Error`: Issue contacting FMCSA API.


## Docker

To build and run the container locally:

```bash
docker build -t happyrobot-api .
docker run -p 3000:3000 happyrobot-api
```

Docker Hub image link: *franciscoramos3010/happyrobot-api*

## File Structure

- `server.js`: API server entry point
- `routes/`: Load and verification route handlers
- `services/`: FMCSA and load handling logic
- `utils/csvParser.js`: Stream-based CSV parsing
- `loads.csv`: Load data source

## Notes

- If multiple loads share a reference number, only the first match is returned.
- Stream-based parsing avoids loading the full file into memory, ensuring scalability for large datasets.
