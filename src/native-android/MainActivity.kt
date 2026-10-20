package com.ravkav.nfc

import android.app.PendingIntent
import android.content.Intent
import android.nfc.NfcAdapter
import android.nfc.Tag
import android.os.Bundle
import android.widget.TextView
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity

class MainActivity : AppCompatActivity() {

    private var nfcAdapter: NfcAdapter? = null
    private var pendingIntent: PendingIntent? = null
    private val reader = RavKavReader()

    private lateinit var tvStatus: TextView
    private lateinit var tvCardNumber: TextView
    private lateinit var tvBalance: TextView
    private lateinit var tvUid: TextView

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        tvStatus = findViewById(R.id.tvStatus)
        tvCardNumber = findViewById(R.id.tvCardNumber)
        tvBalance = findViewById(R.id.tvBalance)
        tvUid = findViewById(R.id.tvUid)

        nfcAdapter = NfcAdapter.getDefaultAdapter(this)
        if (nfcAdapter == null) {
            tvStatus.text = "מכשיר זה אינו כולל אנטנת NFC"
            return
        }

        val intent = Intent(this, javaClass).addFlags(Intent.FLAG_ACTIVITY_SINGLE_TOP)
        pendingIntent = PendingIntent.getActivity(
            this, 0, intent,
            PendingIntent.FLAG_MUTABLE or PendingIntent.FLAG_UPDATE_CURRENT
        )

        // Handle card tapped on cold launch
        handleIntent(this.intent)
    }

    override fun onResume() {
        super.onResume()
        nfcAdapter?.enableForegroundDispatch(this, pendingIntent, null, null)
    }

    override fun onPause() {
        super.onPause()
        nfcAdapter?.disableForegroundDispatch(this)
    }

    override fun onNewIntent(intent: Intent) {
        super.onNewIntent(intent)
        handleIntent(intent)
    }

    private fun handleIntent(intent: Intent?) {
        if (intent == null) return
        val action = intent.action
        if (NfcAdapter.ACTION_TECH_DISCOVERED == action ||
            NfcAdapter.ACTION_TAG_DISCOVERED == action) {

            val tag: Tag? = intent.getParcelableExtra(NfcAdapter.EXTRA_TAG)
            if (tag != null) {
                tvStatus.text = "קורא כרטיס רב-קו דרך אנטנת ה-NFC..."
                val cardData = reader.readCard(tag)
                if (cardData != null) {
                    tvStatus.text = "כרטיס רב-קו נקרא בהצלחה!"
                    tvCardNumber.text = "מספר כרטיס (10 ספרות): ${cardData.cardNumber10Digits}"
                    tvBalance.text = "יתרת ערך צבור: ₪${cardData.storedValueNis}"
                    tvUid.text = "מזהה שבב UID: ${cardData.cardUidHex}"
                    Toast.makeText(this, "רב-קו ${cardData.cardNumber10Digits} זוהה!", Toast.LENGTH_SHORT).show()
                } else {
                    tvStatus.text = "שגיאה בפענוח קובצי ה-Calypso של הכרטיס"
                }
            }
        }
    }
}
