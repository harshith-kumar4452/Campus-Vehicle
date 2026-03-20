# Campus Vehicle Management - Database Schema Design

## 1. Overview
The database is designed to manage vehicle registrations, ownership (Students/Faculty), and track violation history within the campus. It uses a relational structure (PostgreSQL) hosted on Supabase.

## 2. Table Definitions

### `students`
Stores details of students who own vehicles.
- `id` (UUID, PK): Unique identifier.
- `full_name` (Text): Student's name.
- `roll_number` (Text, Unique): Official university roll number.
- `year` (Text): Academic year (1st, 2nd, etc).
- `branch` (Text): Academic department/branch.
- `section` (Text): Roll section (A, B, C, D).
- `phone` (Text): Primary contact.
- `parent_guardian_phone` (Text): Secondary contact.
- `dl_number` (Text, Unique): Driving license number.
- `dl_url` (Text): Link to driving license document.
- `id_card_url` (Text): Link to university ID card document.

### `faculty`
Stores details of faculty members who own vehicles.
- `id` (UUID, PK): Unique identifier.
- `full_name` (Text): Faculty name.
- `faculty_id_number` (Text, Unique): Employee ID.
- `department` (Text): Primary department.
- `email` (Text, Unique): Official email.
- `phone` (Text): Primary contact.
- `parent_spouse_phone` (Text): Secondary contact.
- `dl_number` (Text, Unique): Driving license number.

### `vehicles`
Core table linking owners to their vehicle assets.
- `id` (UUID, PK): Unique identifier.
- `plate_number` (Text, Unique): Vehicle license plate.
- `vehicle_type` (Text): Type (Car/Bike).
- `status` (Text): Registration status (Pending/Approved/Rejected).
- `student_id` (UUID, FK): References `students.id`.
- `faculty_id` (UUID, FK): References `faculty.id`.
- `offense_count` (Integer): Summary count of violations.

### `violations`
Tracks individual offense instances.
- `id` (UUID, PK): Unique identifier.
- `vehicle_id` (UUID, FK): References `vehicles.id`.
- `violation_type` (Text): Type of offense (e.g., Speeding).
- `description` (Text): Details of the incident.
- `fine_amount` (Decimal): Monetary penalty.
- `fine_status` (Text): Payment status (Pending/Paid/Waived).
- `warning_issued` (Boolean): Flag for first-time warnings.

### `admins`
Stores pre-authorized system administrators.
- `id` (UUID, PK): Unique identifier.
- `email` (Text, Unique): Admin email.
- `password` (Text): Plaintext password (for simulation).

## 3. Key Relationships
- **One-to-Many**: A `student` or `faculty` member can own multiple `vehicles` (though usually one is registered).
- **One-to-Many**: A `vehicle` can have multiple `violations`.
- **Exclusive Arc**: A `vehicle` MUST belong to EITHER a `student` OR a `faculty` member, ensured via SQL constraints.

## 4. Query Examples (CRUD)

### Create Violation
```sql
INSERT INTO violations (vehicle_id, violation_type, fine_amount) 
VALUES ('uuid-here', 'Speeding', 500.00);
```

### Read Vehicle Status with Owner
```sql
SELECT v.plate_number, s.full_name as owner_name, v.status
FROM vehicles v
LEFT JOIN students s ON v.student_id = s.id
WHERE v.plate_number = 'TS09BD1234';
```

### Update Offense Count
```sql
UPDATE vehicles SET offense_count = offense_count + 1 WHERE id = 'uuid';
```
