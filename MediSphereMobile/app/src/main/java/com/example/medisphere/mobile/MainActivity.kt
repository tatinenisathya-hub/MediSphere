package com.example.medisphere.mobile

import android.os.Bundle

import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll

import androidx.compose.material3.Button
import androidx.compose.material3.Card
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Surface
import androidx.compose.material3.Text

import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.setValue

import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp

import androidx.lifecycle.lifecycleScope

import androidx.health.connect.client.HealthConnectClient
import androidx.health.connect.client.PermissionController
import androidx.health.connect.client.permission.HealthPermission
import androidx.health.connect.client.records.HeartRateRecord
import androidx.health.connect.client.records.OxygenSaturationRecord
import androidx.health.connect.client.request.ReadRecordsRequest
import androidx.health.connect.client.time.TimeRangeFilter

import kotlinx.coroutines.launch

import java.time.Duration
import java.time.Instant
import java.time.LocalDateTime
import java.time.ZoneId


class MainActivity : ComponentActivity() {

    private lateinit var healthConnectClient: HealthConnectClient


    // ====================================================================
    // HEALTH CONNECT PERMISSIONS
    // ====================================================================

    private val requiredPermissions = setOf(

        HealthPermission.getReadPermission(
            HeartRateRecord::class
        ),

        HealthPermission.getReadPermission(
            OxygenSaturationRecord::class
        )
    )


    // ====================================================================
    // HEALTH DATA STATE
    // ====================================================================

    private var heartRate by mutableStateOf<Double?>(null)

    private var oxygenSaturation by mutableStateOf<Double?>(null)

    private var heartRateRecordCount by mutableStateOf(0)

    private var oxygenRecordCount by mutableStateOf(0)

    private var heartRateSource by mutableStateOf("No record")

    private var oxygenSource by mutableStateOf("No record")

    private var heartRateTime by mutableStateOf("No record")

    private var oxygenTime by mutableStateOf("No record")


    // ====================================================================
    // BACKEND CONNECTION STATE
    // ====================================================================

    /*
     * Enter the real MediSphere Patient ID.
     */
    private var patientId by mutableStateOf("")


    /*
     * Health Connect currently reports Xiaomi's source package as:
     *
     * com.xiaomi.wearable
     */
    private var deviceId by mutableStateOf(
        "com.xiaomi.wearable"
    )


    private val deviceType =
        "SMARTWATCH"


    // ====================================================================
    // STATUS
    // ====================================================================

    private var statusMessage by mutableStateOf(
        "Health Connect is not connected."
    )

    private var errorMessage by mutableStateOf("")


    // ====================================================================
    // HEALTH CONNECT PERMISSION RESULT
    // ====================================================================

    private val permissionLauncher =
        registerForActivityResult(
            PermissionController.createRequestPermissionResultContract()
        ) { grantedPermissions ->

            if (
                grantedPermissions.containsAll(
                    requiredPermissions
                )
            ) {

                statusMessage =
                    "Health Connect permissions granted."

                errorMessage = ""

                readWearableData()

            } else {

                statusMessage =
                    "Heart rate and oxygen saturation permissions are required."

                errorMessage =
                    "Please allow both Heart rate and Oxygen saturation."
            }
        }


    // ====================================================================
    // ACTIVITY CREATED
    // ====================================================================

    override fun onCreate(
        savedInstanceState: Bundle?
    ) {

        super.onCreate(savedInstanceState)


        healthConnectClient =
            HealthConnectClient.getOrCreate(this)


        setContent {

            MaterialTheme {

                Surface(
                    modifier = Modifier.fillMaxSize()
                ) {

                    MediSphereScreen(

                        patientId =
                            patientId,

                        deviceId =
                            deviceId,

                        heartRate =
                            heartRate,

                        oxygenSaturation =
                            oxygenSaturation,

                        heartRateRecordCount =
                            heartRateRecordCount,

                        oxygenRecordCount =
                            oxygenRecordCount,

                        heartRateSource =
                            heartRateSource,

                        oxygenSource =
                            oxygenSource,

                        heartRateTime =
                            heartRateTime,

                        oxygenTime =
                            oxygenTime,

                        statusMessage =
                            statusMessage,

                        errorMessage =
                            errorMessage,

                        onPatientIdChange = {
                            patientId = it
                        },

                        onDeviceIdChange = {
                            deviceId = it
                        },

                        onConnectHealthConnect = {
                            connectHealthConnect()
                        },

                        onRefresh = {
                            readWearableData()
                        },

                        onSendToBackend = {
                            sendLatestHeartRateToBackend()
                        }
                    )
                }
            }
        }


        checkPermissions()
    }


    // ====================================================================
    // CHECK HEALTH CONNECT PERMISSIONS
    // ====================================================================

    private fun checkPermissions() {

        lifecycleScope.launch {

            try {

                val grantedPermissions =
                    healthConnectClient
                        .permissionController
                        .getGrantedPermissions()


                if (
                    grantedPermissions.containsAll(
                        requiredPermissions
                    )
                ) {

                    statusMessage =
                        "Health Connect permissions already granted."

                    readWearableData()

                } else {

                    statusMessage =
                        "Connect Health Connect to read wearable data."
                }

            } catch (exception: Exception) {

                errorMessage =
                    "Unable to check Health Connect permissions: " +
                            exception.message
            }
        }
    }


    // ====================================================================
    // CONNECT HEALTH CONNECT
    // ====================================================================

    private fun connectHealthConnect() {

        lifecycleScope.launch {

            try {

                val grantedPermissions =
                    healthConnectClient
                        .permissionController
                        .getGrantedPermissions()


                val permissionsToRequest =
                    requiredPermissions -
                            grantedPermissions


                if (
                    permissionsToRequest.isEmpty()
                ) {

                    statusMessage =
                        "Health Connect permissions already granted."

                    readWearableData()

                } else {

                    permissionLauncher.launch(
                        permissionsToRequest
                    )
                }

            } catch (exception: Exception) {

                errorMessage =
                    "Unable to connect to Health Connect: " +
                            exception.message
            }
        }
    }


    // ====================================================================
    // READ REAL WEARABLE DATA
    // ====================================================================

    private fun readWearableData() {

        lifecycleScope.launch {

            try {

                errorMessage = ""

                statusMessage =
                    "Reading real wearable data from Health Connect..."


                val endTime =
                    Instant.now()


                val startTime =
                    endTime.minus(
                        Duration.ofDays(7)
                    )


                // ========================================================
                // HEART RATE
                // ========================================================

                val heartRateRecords =
                    readAllHeartRateRecords(
                        startTime,
                        endTime
                    )


                heartRateRecordCount =
                    heartRateRecords.size


                if (
                    heartRateRecords.isNotEmpty()
                ) {

                    val latestRecord =
                        heartRateRecords.maxByOrNull {
                            it.endTime
                        }


                    if (
                        latestRecord != null
                    ) {

                        val latestSample =
                            latestRecord.samples.maxByOrNull {
                                it.time
                            }


                        if (
                            latestSample != null
                        ) {

                            heartRate =
                                latestSample
                                    .beatsPerMinute
                                    .toDouble()


                            heartRateTime =
                                latestSample
                                    .time
                                    .toString()


                            heartRateSource =
                                latestRecord
                                    .metadata
                                    .dataOrigin
                                    .packageName

                        } else {

                            heartRate = null

                            heartRateTime =
                                "Record has no samples."

                            heartRateSource =
                                latestRecord
                                    .metadata
                                    .dataOrigin
                                    .packageName
                        }
                    }

                } else {

                    heartRate = null

                    heartRateSource =
                        "No Heart Rate records found."

                    heartRateTime =
                        "No record"
                }


                // ========================================================
                // OXYGEN SATURATION
                // ========================================================

                val oxygenRecords =
                    readAllOxygenRecords(
                        startTime,
                        endTime
                    )


                oxygenRecordCount =
                    oxygenRecords.size


                if (
                    oxygenRecords.isNotEmpty()
                ) {

                    val latestRecord =
                        oxygenRecords.maxByOrNull {
                            it.time
                        }


                    if (
                        latestRecord != null
                    ) {

                        oxygenSaturation =
                            latestRecord
                                .percentage
                                .value


                        oxygenTime =
                            latestRecord
                                .time
                                .toString()


                        oxygenSource =
                            latestRecord
                                .metadata
                                .dataOrigin
                                .packageName
                    }

                } else {

                    oxygenSaturation = null

                    oxygenSource =
                        "No Oxygen Saturation records found."

                    oxygenTime =
                        "No record"
                }


                // ========================================================
                // FINAL STATUS
                // ========================================================

                if (
                    heartRateRecordCount == 0 &&
                    oxygenRecordCount == 0
                ) {

                    statusMessage =
                        "Health Connect read succeeded, but no Heart Rate or SpO₂ records were found in the last 7 days."

                } else {

                    statusMessage =
                        "Health Connect data read successfully."
                }

            } catch (
                securityException: SecurityException
            ) {

                errorMessage =
                    "Health Connect permission error: " +
                            securityException.message

                statusMessage =
                    "Unable to read Health Connect data."

            } catch (
                exception: Exception
            ) {

                errorMessage =
                    "Health Connect read error: " +
                            exception.message

                statusMessage =
                    "Unable to read wearable data."
            }
        }
    }


    // ====================================================================
    // SEND REAL HEART RATE TO BACKEND
    // ====================================================================

    private fun sendLatestHeartRateToBackend() {

        lifecycleScope.launch {

            try {

                errorMessage = ""


                // --------------------------------------------------------
                // CHECK PATIENT ID
                // --------------------------------------------------------

                if (
                    patientId.isBlank()
                ) {

                    errorMessage =
                        "Please enter the MediSphere Patient ID."

                    statusMessage =
                        "Patient ID is required."

                    return@launch
                }


                // --------------------------------------------------------
                // CHECK HEART RATE
                // --------------------------------------------------------

                val currentHeartRate =
                    heartRate


                if (
                    currentHeartRate == null
                ) {

                    errorMessage =
                        "No real heart-rate record is available."

                    statusMessage =
                        "Refresh wearable data first."

                    return@launch
                }


                // --------------------------------------------------------
                // CHECK DEVICE ID
                // --------------------------------------------------------

                if (
                    deviceId.isBlank()
                ) {

                    errorMessage =
                        "Wearable device ID is required."

                    statusMessage =
                        "Device ID is required."

                    return@launch
                }


                statusMessage =
                    "Sending real heart-rate data to MediSphere..."


                // --------------------------------------------------------
                // CONVERT HEALTH CONNECT INSTANT TO LOCAL DATE-TIME
                // --------------------------------------------------------

                val recordedAt =
                    try {

                        LocalDateTime.ofInstant(
                            Instant.parse(
                                heartRateTime
                            ),
                            ZoneId.systemDefault()
                        ).toString()

                    } catch (
                        exception: Exception
                    ) {

                        LocalDateTime.now()
                            .toString()
                    }


                // --------------------------------------------------------
                // CREATE BACKEND READING
                //
                // ONLY REAL HEART RATE IS SENT.
                //
                // Unsupported/unavailable values remain null.
                // --------------------------------------------------------

                val reading =
                    WearableBackendReading(

                        patientId =
                            patientId.trim(),

                        deviceId =
                            deviceId.trim(),

                        deviceType =
                            deviceType,

                        heartRate =
                            currentHeartRate,

                        temperature =
                            null,

                        systolicBloodPressure =
                            null,

                        diastolicBloodPressure =
                            null,

                        oxygenSaturation =
                            null,

                        respiratoryRate =
                            null,

                        recordedAt =
                            recordedAt
                    )


                // --------------------------------------------------------
                // SEND TO SPRING BOOT
                // --------------------------------------------------------

                val result =
                    BackendApi.sendWearableReading(
                        reading
                    )


                result.fold(

                    onSuccess = {

                        statusMessage =
                            "Real heart-rate data sent successfully."

                        errorMessage = ""
                    },

                    onFailure = { exception ->

                        statusMessage =
                            "Unable to send wearable data."

                        errorMessage =
                            exception.message
                                ?: "Unknown backend error."
                    }
                )

            } catch (
                exception: Exception
            ) {

                statusMessage =
                    "Unable to send wearable data."

                errorMessage =
                    exception.message
                        ?: "Unknown error."
            }
        }
    }


    // ====================================================================
    // READ ALL HEART RATE RECORDS
    // ====================================================================

    private suspend fun readAllHeartRateRecords(
        startTime: Instant,
        endTime: Instant
    ): List<HeartRateRecord> {

        val allRecords =
            mutableListOf<HeartRateRecord>()


        var pageToken: String? = null


        do {

            val response =
                healthConnectClient.readRecords(

                    ReadRecordsRequest(
                        recordType =
                            HeartRateRecord::class,

                        timeRangeFilter =
                            TimeRangeFilter.between(
                                startTime,
                                endTime
                            ),

                        pageToken =
                            pageToken
                    )
                )


            allRecords.addAll(
                response.records
            )


            pageToken =
                response.pageToken

        } while (
            !pageToken.isNullOrEmpty()
        )


        return allRecords
    }


    // ====================================================================
    // READ ALL OXYGEN RECORDS
    // ====================================================================

    private suspend fun readAllOxygenRecords(
        startTime: Instant,
        endTime: Instant
    ): List<OxygenSaturationRecord> {

        val allRecords =
            mutableListOf<OxygenSaturationRecord>()


        var pageToken: String? = null


        do {

            val response =
                healthConnectClient.readRecords(

                    ReadRecordsRequest(
                        recordType =
                            OxygenSaturationRecord::class,

                        timeRangeFilter =
                            TimeRangeFilter.between(
                                startTime,
                                endTime
                            ),

                        pageToken =
                            pageToken
                    )
                )


            allRecords.addAll(
                response.records
            )


            pageToken =
                response.pageToken

        } while (
            !pageToken.isNullOrEmpty()
        )


        return allRecords
    }
}


// ========================================================================
// UI
// ========================================================================

@androidx.compose.runtime.Composable
fun MediSphereScreen(

    patientId: String,

    deviceId: String,

    heartRate: Double?,

    oxygenSaturation: Double?,

    heartRateRecordCount: Int,

    oxygenRecordCount: Int,

    heartRateSource: String,

    oxygenSource: String,

    heartRateTime: String,

    oxygenTime: String,

    statusMessage: String,

    errorMessage: String,

    onPatientIdChange: (String) -> Unit,

    onDeviceIdChange: (String) -> Unit,

    onConnectHealthConnect: () -> Unit,

    onRefresh: () -> Unit,

    onSendToBackend: () -> Unit

) {

    /*
     * IMPORTANT:
     *
     * The screen contains more content than can fit vertically
     * on a phone display.
     *
     * verticalScroll() allows the user to scroll down and reach:
     *
     * 1. Connect Health Connect
     * 2. Refresh Wearable Data
     * 3. Send Heart Rate to MediSphere
     */

    val scrollState =
        rememberScrollState()


    Column(

        modifier =
            Modifier
                .fillMaxSize()
                .verticalScroll(
                    scrollState
                )
                .padding(24.dp),

        verticalArrangement =
            Arrangement.Top,

        horizontalAlignment =
            Alignment.CenterHorizontally

    ) {

        // ================================================================
        // TITLE
        // ================================================================

        Text(
            text = "MediSphere",
            style =
                MaterialTheme.typography.headlineMedium
        )


        Spacer(
            modifier =
                Modifier.height(8.dp)
        )


        Text(
            text = "Real Wearable Health Data",
            style =
                MaterialTheme.typography.titleMedium
        )


        Spacer(
            modifier =
                Modifier.height(20.dp)
        )


        // ================================================================
        // PATIENT ID
        // ================================================================

        OutlinedTextField(

            value =
                patientId,

            onValueChange =
                onPatientIdChange,

            modifier =
                Modifier.fillMaxWidth(),

            label = {
                Text(
                    "MediSphere Patient ID"
                )
            },

            singleLine = true
        )


        Spacer(
            modifier =
                Modifier.height(12.dp)
        )


        // ================================================================
        // DEVICE ID
        // ================================================================

        OutlinedTextField(

            value =
                deviceId,

            onValueChange =
                onDeviceIdChange,

            modifier =
                Modifier.fillMaxWidth(),

            label = {
                Text(
                    "Wearable Device ID"
                )
            },

            singleLine = true
        )


        Spacer(
            modifier =
                Modifier.height(20.dp)
        )


        // ================================================================
        // STATUS
        // ================================================================

        Text(
            text =
                statusMessage,

            style =
                MaterialTheme.typography.bodyMedium
        )


        if (
            errorMessage.isNotBlank()
        ) {

            Spacer(
                modifier =
                    Modifier.height(8.dp)
            )


            Text(
                text =
                    errorMessage,

                style =
                    MaterialTheme.typography.bodyMedium
            )
        }


        Spacer(
            modifier =
                Modifier.height(20.dp)
        )


        // ================================================================
        // HEART RATE
        // ================================================================

        Card(

            modifier =
                Modifier.fillMaxWidth()

        ) {

            Column(

                modifier =
                    Modifier.padding(20.dp)

            ) {

                Text(
                    text =
                        "Heart Rate",

                    style =
                        MaterialTheme.typography.titleLarge
                )


                Spacer(
                    modifier =
                        Modifier.height(8.dp)
                )


                Text(

                    text =
                        if (
                            heartRate != null
                        )
                            "${heartRate.toInt()} BPM"
                        else
                            "--",

                    style =
                        MaterialTheme.typography.headlineMedium
                )


                Spacer(
                    modifier =
                        Modifier.height(8.dp)
                )


                Text(
                    text =
                        "Records found: $heartRateRecordCount"
                )


                Text(
                    text =
                        "Source: $heartRateSource"
                )


                Text(
                    text =
                        "Time: $heartRateTime"
                )
            }
        }


        Spacer(
            modifier =
                Modifier.height(16.dp)
        )


        // ================================================================
        // OXYGEN SATURATION
        // ================================================================

        Card(

            modifier =
                Modifier.fillMaxWidth()

        ) {

            Column(

                modifier =
                    Modifier.padding(20.dp)

            ) {

                Text(
                    text =
                        "Oxygen Saturation",

                    style =
                        MaterialTheme.typography.titleLarge
                )


                Spacer(
                    modifier =
                        Modifier.height(8.dp)
                )


                Text(

                    text =
                        if (
                            oxygenSaturation != null
                        )
                            String.format(
                                "%.1f%%",
                                oxygenSaturation
                            )
                        else
                            "--",

                    style =
                        MaterialTheme.typography.headlineMedium
                )


                Spacer(
                    modifier =
                        Modifier.height(8.dp)
                )


                Text(
                    text =
                        "Records found: $oxygenRecordCount"
                )


                Text(
                    text =
                        "Source: $oxygenSource"
                )


                Text(
                    text =
                        "Time: $oxygenTime"
                )
            }
        }


        Spacer(
            modifier =
                Modifier.height(24.dp)
        )


        // ================================================================
        // CONNECT HEALTH CONNECT
        // ================================================================

        Button(

            onClick =
                onConnectHealthConnect,

            modifier =
                Modifier.fillMaxWidth()

        ) {

            Text(
                text =
                    "Connect Health Connect"
            )
        }


        Spacer(
            modifier =
                Modifier.height(12.dp)
        )


        // ================================================================
        // REFRESH
        // ================================================================

        Button(

            onClick =
                onRefresh,

            modifier =
                Modifier.fillMaxWidth()

        ) {

            Text(
                text =
                    "Refresh Wearable Data"
            )
        }


        Spacer(
            modifier =
                Modifier.height(12.dp)
        )


        // ================================================================
        // SEND TO MEDISPHERE BACKEND
        // ================================================================

        Button(

            onClick =
                onSendToBackend,

            modifier =
                Modifier.fillMaxWidth()

        ) {

            Text(
                text =
                    "Send Heart Rate to MediSphere"
            )
        }


        Spacer(
            modifier =
                Modifier.height(24.dp)
        )
    }
}