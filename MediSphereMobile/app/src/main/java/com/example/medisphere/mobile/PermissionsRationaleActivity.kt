package com.example.medisphere.mobile

import android.os.Bundle
import android.widget.TextView
import androidx.activity.ComponentActivity

class PermissionsRationaleActivity : ComponentActivity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        val textView = TextView(this)

        textView.text = """
            MediSphere Health Data Privacy

            MediSphere requests access to your heart rate and oxygen saturation data from Health Connect.

            This data is used to display your wearable health measurements in the MediSphere healthcare application.

            MediSphere only accesses this health data after you grant permission.

            You can revoke Health Connect permissions at any time from Android Settings.
        """.trimIndent()

        textView.textSize = 18f

        textView.setPadding(
            48,
            48,
            48,
            48
        )

        setContentView(textView)
    }
}