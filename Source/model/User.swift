//
//  User.swift
//  Faustus
//
//  Created by Alexander Dittner on 10.02.2020.
//  Copyright © 2020 Alexander Dittner. All rights reserved.
//

import Foundation
class User: Storable, ObservableObject {
    let id: UID

    @Published var name: String = ""
    @Published var pwd: String = ""
    @Published var isLoggedIn: Bool = false
    @Published var validationStatus: ValidationStatus = .ok
    @Published var isEditing: Bool = false

    private var encryptedPwd: String = ""

    required init(id: UID) {
        self.id = id
    }

    private func encryptPwd() -> String {
        return (name + pwd).sha512()!
    }

    func willStore() -> Bool {
        encryptedPwd.isEmpty
    }
    
    func didStore() {}

    func validate() -> ValidationStatus {
        if name == "" {
            return .emptyName
        } else if pwd == "" {
            return .emptyPassword
        } else if !encryptedPwd.isEmpty && encryptedPwd != encryptPwd() {
            return .invalidUserPwdOrName
        } else {
            return .ok
        }
    }

    func serialize() -> [String: Any] {
        return ["id": id, "name": name, "encryptedPwd": encryptPwd()]
    }

    func deserialize(from dict: [String: Any]) {
        name = dict["name"] as? String ?? ""
        encryptedPwd = dict["encryptedPwd"] as? String ?? ""
    }
}

extension Conspectus {
    var asUser: User? { return content as? User }
}
