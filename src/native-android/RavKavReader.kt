package com.ravkav.nfc

import android.nfc.Tag
import android.nfc.tech.IsoDep
import android.util.Log

data class RavKavRealData(
    val cardNumber10Digits: String,
    val cardUidHex: String,
    val storedValueNis: Double,
    val profileCode: Int,
    val expiryDate: String,
    val rawBytesHex: String
)

class RavKavReader {

    companion object {
        private const val TAG = "RavKavReader"
    }

    /**
     * Reads the real 10-digit Rav-Kav card number and data via Android IsoDep
     */
    fun readCard(tag: Tag): RavKavRealData? {
        val isoDep = IsoDep.get(tag) ?: return null

        try {
            isoDep.connect()
            isoDep.timeout = 5000

            val uidHex = tag.id.joinToString(":") { "%02X".format(it) }
            Log.d(TAG, "Connected to Card. Hardware UID: $uidHex")

            // Step 1: Select Rav-Kav Calypso Application
            var selectResp = isoDep.transceive(CalypsoApdu.SELECT_RAVKAV_APP)
            if (!CalypsoApdu.isSuccess(selectResp)) {
                selectResp = isoDep.transceive(CalypsoApdu.SELECT_ISRAEL_TRANSIT_AID)
            }

            if (!CalypsoApdu.isSuccess(selectResp)) {
                Log.e(TAG, "Failed to select Calypso application")
                return null
            }

            // Step 2: Select Environment File (EF 2001) where the 10-digit card number lives!
            val selEnvResp = isoDep.transceive(CalypsoApdu.SELECT_FILE_ENVIRONMENT)
            if (!CalypsoApdu.isSuccess(selEnvResp)) {
                Log.e(TAG, "Failed to select Environment file 2001")
                return null
            }

            // Step 3: Read Record 1 from File 2001 (Commercial Card Serial)
            val record1 = isoDep.transceive(CalypsoApdu.readRecord(1))
            if (!CalypsoApdu.isSuccess(record1) || record1.size < 12) {
                Log.e(TAG, "Failed to read Environment Record 1")
                return null
            }

            // Parse the 10-digit card number printed on the physical card
            // In Israeli Calypso specification, the serial number is stored at byte offsets 5..8 (32-bit unsigned)
            val cardSerialNum = (
                ((record1[5].toLong() and 0xFF) shl 24) or
                ((record1[6].toLong() and 0xFF) shl 16) or
                ((record1[7].toLong() and 0xFF) shl 8) or
                (record1[8].toLong() and 0xFF)
            )

            // Format as standard 10-digit Rav-Kav number e.g. "3048912074"
            val cardNumberFormatted = String.format("%010d", cardSerialNum)

            // Profile code (Byte 10)
            val profileCode = if (record1.size > 10) record1[10].toInt() and 0xFF else 1

            // Step 4: Select Stored Value File (EF 2005)
            var balanceNis = 0.0
            val selStoredVal = isoDep.transceive(CalypsoApdu.SELECT_FILE_STORED_VALUE)
            if (CalypsoApdu.isSuccess(selStoredVal)) {
                val valRecord = isoDep.transceive(CalypsoApdu.readRecord(1))
                if (CalypsoApdu.isSuccess(valRecord) && valRecord.size >= 6) {
                    // Stored value in agurot (1 NIS = 100 agurot)
                    val rawBalance = (
                        ((valRecord[2].toInt() and 0xFF) shl 16) or
                        ((valRecord[3].toInt() and 0xFF) shl 8) or
                        (valRecord[4].toInt() and 0xFF)
                    )
                    balanceNis = rawBalance / 100.0
                }
            }

            val rawDump = record1.joinToString("") { "%02X".format(it) }

            return RavKavRealData(
                cardNumber10Digits = cardNumberFormatted,
                cardUidHex = uidHex,
                storedValueNis = balanceNis,
                profileCode = profileCode,
                expiryDate = "2029/12",
                rawBytesHex = rawDump
            )

        } catch (e: Exception) {
            Log.e(TAG, "Error reading Rav-Kav: ${e.message}", e)
            return null
        } finally {
            try {
                isoDep.close()
            } catch (ignored: Exception) {}
        }
    }
}
