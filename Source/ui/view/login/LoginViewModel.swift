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
import AppKit

final class LoginViewModel: ViewModel {
    public var user: User!
    public let projectDir:String
    private var disposeBag: Set<AnyCancellable> = []
    @Published var errorMsg: String = ""
    @Published var filesLoading: Bool = false

    init() {
        logInfo(tag: .APP, msg: "LoginViewModel init")
        projectDir = DocumentsStorage.shared.projectURL.relativePath
        user = model.user
        print("user name = \(model.user.content.name)")
    }

    func login() {
        let status = user.validate()
        if status == .ok {
            errorMsg = ""
            
            let appDelegate = NSApplication.shared.delegate as! AppDelegate
            appDelegate.window?.makeFirstResponder(nil)
            print("LoggedIn")
            user.content.isLoggedIn = true
            DocumentsStorage.shared.cryptor = AESCryptor(pwd: user.content.pwd)
            model.loadUserFiles()
            filesLoading = true
        } else {
            errorMsg = status.rawValue
        }
    }
}
