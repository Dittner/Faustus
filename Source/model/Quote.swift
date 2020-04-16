//
//  Quote.swift
//  Faustus
//
//  Created by Alexander Dittner on 22.03.2020.
//  Copyright © 2020 Alexander Dittner. All rights reserved.
//

import Combine
import Foundation
import SwiftUI

class Quote: ObservableObject, Equatable, Comparable {
    static func < (lhs: Quote, rhs: Quote) -> Bool {
        Int(lhs.startPage) ?? 0 < Int(rhs.startPage) ?? 0
    }
    
    static func == (lhs: Quote, rhs: Quote) -> Bool {
        lhs.id == rhs.id
    }

    var id: UID = UID()
    let book: Book
    @Published var text: String = "Neues Zitat"
    @Published var startPage: String = ""
    @Published var endPage: String = ""
    @Published var isValid: Bool = false

    private var disposeBag: Set<AnyCancellable> = []

    init(book: Book) {
        self.book = book

        Publishers.CombineLatest3($text, $startPage, $endPage)
            .dropFirst()
            .sink { text, startPage, _ in
                self.book.state.markAsChanged()
                self.isValid = !text.isEmpty && !startPage.isEmpty
            }
            .store(in: &disposeBag)
    }

    func serialize() -> [String: Any] {
        var dict: [String: Any] = [:]
        dict["id"] = id
        dict["text"] = text
        dict["startPage"] = startPage
        dict["endPage"] = endPage
        return dict
    }

    func deserialize(_ dict: [String: Any]) -> Quote {
        id = dict["id"] as! UID
        text = dict["text"] as? String ?? ""
        startPage = dict["startPage"] as? String ?? ""
        endPage = dict["endPage"] as? String ?? ""
        return self
    }
}
