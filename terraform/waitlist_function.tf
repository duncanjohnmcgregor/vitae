# Create Firestore database for waitlist
resource "google_firestore_database" "waitlist_db" {
  name        = "vitae-waitlist"
  location_id = var.region
  type        = "FIRESTORE_NATIVE"
}

# Create Cloud Function for waitlist submissions
resource "google_cloudfunctions_function" "waitlist_function" {
  name        = "waitlist-submission"
  description = "Handles waitlist form submissions"
  runtime     = "nodejs18"

  available_memory_mb   = 256
  source_archive_bucket = google_storage_bucket.website_bucket.name
  source_archive_object = google_storage_bucket_object.waitlist_function_zip.name
  trigger_http          = true
  entry_point           = "handleWaitlistSubmission"

  environment_variables = {
    FIRESTORE_COLLECTION = "waitlist"
  }

  service_account_email = google_service_account.waitlist_function_sa.email
}

# Service account for the Cloud Function
resource "google_service_account" "waitlist_function_sa" {
  account_id   = "waitlist-function"
  display_name = "Waitlist Function Service Account"
}

# Grant the service account access to Firestore
resource "google_project_iam_member" "waitlist_function_firestore" {
  project = var.project_id
  role    = "roles/datastore.user"
  member  = "serviceAccount:${google_service_account.waitlist_function_sa.email}"
}

# Create a zip file containing the Cloud Function code
resource "google_storage_bucket_object" "waitlist_function_zip" {
  name   = "waitlist-function.zip"
  bucket = google_storage_bucket.website_bucket.name
  source = "${path.module}/waitlist-function.zip"
}

# Allow the Cloud Function to be invoked by the website
resource "google_cloudfunctions_function_iam_member" "waitlist_function_invoker" {
  project        = var.project_id
  region         = var.region
  cloud_function = google_cloudfunctions_function.waitlist_function.name
  role           = "roles/cloudfunctions.invoker"
  member         = "allUsers"
} 