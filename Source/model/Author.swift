//
//  Author.swift
//  Faustus
//
//  Created by Alexander Dittner on 24.03.2020.
//  Copyright © 2020 Alexander Dittner. All rights reserved.
//

import Combine
import SwiftUI

class Author: Storable, ObservableObject {
    let id: UID

    @Published var info: String = "Keine Information"
    @Published var name: String = ""
    @Published var surname: String = ""
    @Published var birthYear: String = ""
    @Published var deathYear: String = ""
    @Published var initials: String = ""
    @Published var years: String = ""
    @Published var hasChanges: Bool = false

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

        Publishers.CombineLatest($birthYear, $deathYear)
            .debounce(for: 0.2, scheduler: RunLoop.main)
            .map { birth, death in
                death.count > 0 ? birth + "–" + death : birth
            }
            .assign(to: \.years, on: self)
            .store(in: &disposeBag)

        for prop in [$name, $surname, $birthYear, $deathYear, $info] {
            prop
                .removeDuplicates()
                .map { _ in
                    true
                }
                .assign(to: \.hasChanges, on: self)
                .store(in: &disposeBag)
        }
    }

    func willStore() -> Bool {
        return hasChanges
    }

    func didStore() {
        hasChanges = false
    }

    func validate() -> ValidationStatus {
        if surname == "" {
            return .emptyName
        } else if birthYear == "" {
            return .emptyBirthYear
        } else if deathYear != "", let death = Int(deathYear), let birth = Int(birthYear), death - birth > 120 {
            return .lifeIsTooLong
        } else {
            return .ok
        }
    }

    func serialize() -> [String: Any] {
        return ["id": id, "name": name, "surname": surname, "birthYear": birthYear, "deathYear": deathYear, "info": info]
    }

    func deserialize(from dict: [String: Any]) {
        name = dict["name"] as? String ?? ""
        surname = dict["surname"] as? String ?? ""
        birthYear = dict["birthYear"] as? String ?? ""
        deathYear = dict["deathYear"] as? String ?? ""
        info = dict["info"] as? String ?? ""
        hasChanges = false
    }
}

extension Conspectus {
    var asAuthor: Author? { return content as? Author }
}
