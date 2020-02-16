//
//  LoginViewModel.swift
//  Faustus
//
//  Created by Alexander Dittner on 11.02.2020.
//  Copyright © 2020 Alexander Dittner. All rights reserved.
//

import Combine
import SwiftUI

enum LoginError: String {
    case noUserName = "Name is not filled"
    case noUserPwd = "Password is not filled"
    case mismatch = "Invalid Name or Password"
}

final class LoginViewModel: ObservableObject {
    @Published var userName: String = ""
    @Published var userPwd: String = ""
    @Published var errorMsg: String = ""
    @Published var isLoggedIn: Bool = false

    private var encryptedPwd: String = ""
    private var isNewUserRegistration: Bool = false
    private var cancellableSet: Set<AnyCancellable> = []

    func login() {
        if userName == "" {
            errorMsg = LoginError.noUserName.rawValue
        } else if userPwd == "" {
            errorMsg = LoginError.noUserPwd.rawValue
        } else {
            if isNewUserRegistration {
                storeUserProfile()
                isLoggedIn = true
                errorMsg = ""
            } else if encryptedPwd == encrypt(userName, userPwd) {
                isLoggedIn = true
                errorMsg = ""
            } else {
                errorMsg = LoginError.mismatch.rawValue
            }
        }
    }

    init() {
        // registrationMode = true
        $userName
            .dropFirst()
            .debounce(for: 0.2, scheduler: RunLoop.main)
            .removeDuplicates()
            .map { value in
                value.count > 0 ? "" : LoginError.noUserName.rawValue
            }
            .assign(to: \.errorMsg, on: self)
            .store(in: &cancellableSet)

        $userPwd
            .dropFirst()
            .debounce(for: 0.2, scheduler: RunLoop.main)
            .removeDuplicates()
            .map { value in
                value.count > 0 ? "" : LoginError.noUserPwd.rawValue
            }
            .assign(to: \.errorMsg, on: self)
            .store(in: &cancellableSet)

        readUserProfile()
    }

    func readUserProfile() {
        if let dict = DocumentsStorage.getPlistFile(name: "profile.plist") {
            isNewUserRegistration = false
            print("read profile")

            userName = dict.object(forKey: UserProfile.NameKey) as? String ?? ""
            encryptedPwd = dict.object(forKey: UserProfile.EncryptedPwdKey) as? String ?? ""
        } else {
            isNewUserRegistration = true
            print("No profile")
        }
    }

    func storeUserProfile() {
        let profilePath = DocumentsStorage.projectURL.appendingPathComponent("profile.plist")

        let profile: [String: String] = [UserProfile.NameKey: userName, UserProfile.EncryptedPwdKey: encrypt(userName, userPwd)]

        let dict = NSDictionary(dictionary: profile)
        let success: Bool = dict.write(toFile: profilePath.path, atomically: true)
        if success {
            print("profile has been stored!")
        } else {
            print("unable to store the user profile")
        }
    }
    
    func encrypt(_ userName:String, _ userPwd:String) -> String {
        return (userName + userPwd).hashWith(.sha512)!
    }
}
