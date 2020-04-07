//
//  User.swift
//  Faustus
//
//  Created by Alexander Dittner on 10.02.2020.
//  Copyright © 2020 Alexander Dittner. All rights reserved.
//

import Combine
import Foundation

class User: ConspectusContent, ObservableObject {
    let id: UID

    @Published var name: String = ""
    @Published var surname: String = ""
    @Published var initials: String = ""
    @Published var pwd: String = ""
    @Published var isLoggedIn: Bool = false
    @Published var validationStatus: ValidationStatus = .ok
    @Published var hasChanges: Bool = false

    private(set) var authorID: UID = UID()
    var isRegistered: Bool {
        return !encryptedPwd.isEmpty
    }

    private var encryptedPwd: String = ""

    private var disposeBag: Set<AnyCancellable> = []

    required init(id: UID) {
        self.id = id

        $name
            .debounce(for: 0.2, scheduler: RunLoop.main)
            .removeDuplicates()
            .map { value in
                value.components(separatedBy: " ")
                    .filter { $0 != "" }
                    .map { value in
                        String(value.first!) + "."
                    }
                    .reduce("") { $0 + $1 }
            }
            .assign(to: \.initials, on: self)
            .store(in: &disposeBag)

        for prop in [$name, $surname] {
            prop
                .removeDuplicates()
                .map { _ in
                    true
                }
                .assign(to: \.hasChanges, on: self)
                .store(in: &disposeBag)
        }
    }

    private func encryptPwd() -> String {
        return ("Faustus" + pwd).sha512()!
    }

    func hasChangesToStore() -> Bool {
        return hasChanges
    }

    func didStore() {
        hasChanges = false
    }
    
    func conspectusDidChange() {
        hasChanges = true
    }

    func validate() -> ValidationStatus {
        if name.isEmpty || surname.isEmpty {
            return .emptyName
        } else if pwd.isEmpty {
            return .emptyPassword
        } else if !encryptedPwd.isEmpty && encryptedPwd != encryptPwd() {
            return .invalidUserPwd
        } else {
            return .ok
        }
    }

    func serialize() -> [String: Any] {
        return ["id": id, "name": name, "surname": surname, "encryptedPwd": encryptPwd()]
    }

    func deserialize(from dict: [String: Any]) {
        name = dict["name"] as? String ?? ""
        surname = dict["surname"] as? String ?? ""
        encryptedPwd = dict["encryptedPwd"] as? String ?? ""
        hasChanges = false
    }
    
    func removeLinks(with conspectus:Conspectus) {}
}

extension Conspectus {
    var asUser: User? { return content as? User }
}
