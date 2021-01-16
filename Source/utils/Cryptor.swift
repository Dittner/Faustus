//
//  Cryptor.swift
//  Faustus
//
//  Created by Alexander Dittner on 16.01.2021.
//  Copyright © 2021 Alexander Dittner. All rights reserved.
//

import CryptoKit
import Foundation
protocol Cryptor {
    func encrypt(_ src: Data) throws -> Data
    func decrypt(_ encryptedData: Data) throws -> Data
}

class AESCryptor: Cryptor {
    private let symmetricKey: SymmetricKey
    init(pwd: String) {
        let pwdBits = SHA256.hash(data: ("aes" + pwd).data(using: .utf8)!)
        symmetricKey = SymmetricKey(data: pwdBits)
    }

    func encrypt(_ src: Data) throws -> Data {
        //let message = "Sollen alle Illusionen als unnötig und gefährlich angesehen werden?".data(using: .utf8)!
        let encryptedByAlice = try AES.GCM.seal(src, using: symmetricKey)
        let cipherText = encryptedByAlice.combined!
        return cipherText
        // _ = try? cipherText.write(to: DocumentsStorage.projectURL.appendingPathComponent("encrypted.txt"))
    }

    func decrypt(_ encryptedData: Data) throws -> Data {
        let sealedBoxToOpen = try AES.GCM.SealedBox(combined: encryptedData)
        let decryptedData = try AES.GCM.open(sealedBoxToOpen, using: symmetricKey)
        return decryptedData
        // let decryptedString = String(data: decryptedData, encoding: .utf8)!
    }
}
