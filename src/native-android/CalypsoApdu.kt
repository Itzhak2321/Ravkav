package com.ravkav.nfc

/**
 * Calypso APDU (Application Protocol Data Unit) Command specifications
 * for Israeli Rav-Kav Contactless Smartcards (ISO 7816-4 / ISO 14443-B)
 */
object CalypsoApdu {

    // 1. Select Ministry of Transport Calypso Application (AID)
    // AID: 31 54 49 43 4B 45 54 00 ("1TICKET") or 1.2.376.1.1.1.20
    val SELECT_RAVKAV_APP = byteArrayOf(
        0x00.toByte(), 0xA4.toByte(), 0x04.toByte(), 0x00.toByte(), 0x08.toByte(),
        0x31.toByte(), 0x54.toByte(), 0x49.toByte(), 0x43.toByte(), 0x4B.toByte(), 0x45.toByte(), 0x54.toByte(), 0x00.toByte()
    )

    // Alternative Israeli Ministry of Transport AID
    val SELECT_ISRAEL_TRANSIT_AID = byteArrayOf(
        0x00.toByte(), 0xA4.toByte(), 0x04.toByte(), 0x00.toByte(), 0x07.toByte(),
        0xA0.toByte(), 0x00.toByte(), 0x00.toByte(), 0x02.toByte(), 0x47.toByte(), 0x10.toByte(), 0x01.toByte()
    )

    // 2. Select EF (Elementary File) 2001 - Environment and Card Serial (תעודת כרטיס)
    val SELECT_FILE_ENVIRONMENT = byteArrayOf(
        0x00.toByte(), 0xA4.toByte(), 0x00.toByte(), 0x00.toByte(), 0x02.toByte(),
        0x20.toByte(), 0x01.toByte()
    )

    // 3. Select EF 2020 / 2029 - Contracts and Subscriptions (חוזים ומנויים פעילים)
    val SELECT_FILE_CONTRACTS = byteArrayOf(
        0x00.toByte(), 0xA4.toByte(), 0x00.toByte(), 0x00.toByte(), 0x02.toByte(),
        0x20.toByte(), 0x20.toByte()
    )

    // 4. Select EF 2005 - Counter / Stored Value (קובץ יתרת ערך צבור)
    val SELECT_FILE_STORED_VALUE = byteArrayOf(
        0x00.toByte(), 0xA4.toByte(), 0x00.toByte(), 0x00.toByte(), 0x02.toByte(),
        0x20.toByte(), 0x05.toByte()
    )

    // 5. Select EF 2010 - Event Log / Travel History (קובץ תיקופים ונסיעות אחרונות)
    val SELECT_FILE_EVENTS = byteArrayOf(
        0x00.toByte(), 0xA4.toByte(), 0x00.toByte(), 0x00.toByte(), 0x02.toByte(),
        0x20.toByte(), 0x10.toByte()
    )

    /**
     * Build APDU to read a specific record number from the currently selected EF.
     * Command: 00 B2 [RecordNumber] 04 1D
     */
    fun readRecord(recordNumber: Int): ByteArray {
        return byteArrayOf(
            0x00.toByte(),
            0xB2.toByte(),
            recordNumber.toByte(),
            0x04.toByte(),
            0x1D.toByte() // 29 bytes standard record size in Calypso
        )
    }

    /**
     * Build APDU to read binary file content (Read Binary)
     * Command: 00 B0 [OffsetHigh] [OffsetLow] [Length]
     */
    fun readBinary(offset: Int, length: Int): ByteArray {
        return byteArrayOf(
            0x00.toByte(),
            0xB0.toByte(),
            ((offset shr 8) and 0xFF).toByte(),
            (offset and 0xFF).toByte(),
            (length and 0xFF).toByte()
        )
    }

    /**
     * Check if status word (last 2 bytes) indicates success (0x90 0x00 or 0x61 XX)
     */
    fun isSuccess(response: ByteArray?): Boolean {
        if (response == null || response.size < 2) return false
        val sw1 = response[response.size - 2].toInt() and 0xFF
        val sw2 = response[response.size - 1].toInt() and 0xFF
        return (sw1 == 0x90 && sw2 == 0x00) || sw1 == 0x61
    }
}
