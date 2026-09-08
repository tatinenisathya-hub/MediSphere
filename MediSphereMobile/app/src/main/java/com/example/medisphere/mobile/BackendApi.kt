package com.example.medisphere.mobile

import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import org.json.JSONObject
import java.net.HttpURLConnection
import java.net.URL

data class WearableBackendReading(
    val patientId: String,
    val deviceId: String,
    val deviceType: String,
    val heartRate: Double?,
    val temperature: Double?,
    val systolicBloodPressure: Double?,
    val diastolicBloodPressure: Double?,
    val oxygenSaturation: Double?,
    val respiratoryRate: Double?,
    val recordedAt: String
)

object BackendApi {

    private const val BASE_URL = "http://localhost:8080"

    suspend fun sendWearableReading(
        reading: WearableBackendReading
    ): Result<String> = withContext(Dispatchers.IO) {

        try {
            val url = URL(
                "$BASE_URL/api/wearables/readings/kafka"
            )

            val connection =
                url.openConnection() as HttpURLConnection

            connection.requestMethod = "POST"

            connection.connectTimeout = 10_000
            connection.readTimeout = 10_000

            connection.doOutput = true

            connection.setRequestProperty(
                "Content-Type",
                "application/json"
            )

            connection.setRequestProperty(
                "Accept",
                "application/json"
            )

            val json = JSONObject()

            json.put(
                "patientId",
                reading.patientId
            )

            json.put(
                "deviceId",
                reading.deviceId
            )

            json.put(
                "deviceType",
                reading.deviceType
            )

            if (reading.heartRate != null) {
                json.put(
                    "heartRate",
                    reading.heartRate
                )
            }

            if (reading.temperature != null) {
                json.put(
                    "temperature",
                    reading.temperature
                )
            }

            if (reading.systolicBloodPressure != null) {
                json.put(
                    "systolicBloodPressure",
                    reading.systolicBloodPressure
                )
            }

            if (reading.diastolicBloodPressure != null) {
                json.put(
                    "diastolicBloodPressure",
                    reading.diastolicBloodPressure
                )
            }

            if (reading.oxygenSaturation != null) {
                json.put(
                    "oxygenSaturation",
                    reading.oxygenSaturation
                )
            }

            if (reading.respiratoryRate != null) {
                json.put(
                    "respiratoryRate",
                    reading.respiratoryRate
                )
            }

            json.put(
                "recordedAt",
                reading.recordedAt
            )

            connection.outputStream.use { outputStream ->

                outputStream.write(
                    json.toString()
                        .toByteArray(Charsets.UTF_8)
                )
            }

            val responseCode =
                connection.responseCode

            val responseText =
                if (responseCode in 200..299) {

                    connection.inputStream
                        .bufferedReader()
                        .use { it.readText() }

                } else {

                    connection.errorStream
                        ?.bufferedReader()
                        ?.use { it.readText() }
                        ?: "HTTP $responseCode"
                }

            connection.disconnect()

            if (responseCode in 200..299) {

                Result.success(
                    responseText
                )

            } else {

                Result.failure(
                    Exception(
                        "Backend HTTP $responseCode: $responseText"
                    )
                )
            }

        } catch (exception: Exception) {

            Result.failure(
                exception
            )
        }
    }
}