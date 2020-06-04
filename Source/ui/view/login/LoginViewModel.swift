//
//  LoginViewModel.swift
//  Faustus
//
//  Created by Alexander Dittner on 11.02.2020.
//  Copyright © 2020 Alexander Dittner. All rights reserved.
//

import Combine
import CryptoKit
import SwiftUI

final class LoginViewModel: ViewModel {
    public var user: User!

    private var disposeBag: Set<AnyCancellable> = []
    @Published var errorMsg: String = ""
    @Published var filesLoading: Bool = false

    init() {
        logInfo(tag: .APP, msg: "LoginViewModel init")
        user = model.user
        print("user name = \(model.user.content.name)")
    }

    func login() {
        let status = user.validate()
        if status == .ok {
            errorMsg = ""
            let appDelegate = NSApplication.shared.delegate as! AppDelegate
            appDelegate.window?.makeFirstResponder(nil)
            print("LogedIn")
            user.content.isLoggedIn = true
            model.loadUserFiles()
            filesLoading = true
        } else {
            errorMsg = status.rawValue
        }
    }

//    func encrypt() {
//        let profile: [String: Any] = ["name": "Alexander Dittner", "password": "some-pwd"]
//        let bits = SHA256.hash(data: "Some password".data(using: .utf8)!)
//        let key = SymmetricKey(data: bits)
//        let data = try! NSKeyedArchiver.archivedData(withRootObject: profile, requiringSecureCoding: false)
//
//        let encryptedData = try! AES.GCM.seal(data, using: key)
//        let cipherText = encryptedData.combined!
//        _ = try? cipherText.write(to: DocumentsStorage.projectURL.appendingPathComponent("encrypted.txt"))
//    }
//
//    func decrypt() {
//        let bits = SHA256.hash(data: "Some password".data(using: .utf8)!)
//        let key = SymmetricKey(data: bits)
//
//        let url = DocumentsStorage.projectURL.appendingPathComponent("encrypted.txt")
//        let encryptedData = FileManager.default.contents(atPath: url.path)!
//        let sealedBoxToOpen = try! AES.GCM.SealedBox(combined: encryptedData)
//        let decryptedData = try! AES.GCM.open(sealedBoxToOpen, using: key)
//
    ////        let profile = try! NSKeyedUnarchiver.unarchiveObject(with: decryptedData) as? [String: Any]
//    }
//
//    func encrypt2() {
//        let bits = SHA256.hash(data: "Some password".data(using: .utf8)!)
//        let key = SymmetricKey(data: bits)
//        let message = "Sollen alle Illusionen als unnötig und gefährlich angesehen werden?".data(using: .utf8)!
//        let encryptedByAlice = try! AES.GCM.seal(message, using: key)
//        let cipherText = encryptedByAlice.combined!
//        _ = try? cipherText.write(to: DocumentsStorage.projectURL.appendingPathComponent("encrypted.txt"))
//    }
//
//    func decrypt2() {
//        let bits = SHA256.hash(data: "Some password".data(using: .utf8)!)
//        let key = SymmetricKey(data: bits)
//
//        let url = DocumentsStorage.projectURL.appendingPathComponent("encrypted.txt")
//        let encryptedData = FileManager.default.contents(atPath: url.path)!
//        let sealedBoxToOpen = try! AES.GCM.SealedBox(combined: encryptedData)
//        let decryptedData = try! AES.GCM.open(sealedBoxToOpen, using: key)
//        let decryptedString = String(data: decryptedData, encoding: .utf8)!
//        print(decryptedString)
//    }
}
