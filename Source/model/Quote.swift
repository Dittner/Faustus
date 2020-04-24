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

class Quote: Conspectus, ObservableObject, Comparable {
    static func < (lhs: Quote, rhs: Quote) -> Bool {
        Int(lhs.startPage) ?? 0 < Int(rhs.startPage) ?? 0
    }

    let book: Book
    @Published var text: String = "Neues Zitat"
    @Published var startPage: String = ""
    @Published var endPage: String = ""
    @Published var isValid: Bool = false

    override var genus: ConspectusGenus { return .quote }

    private var disposeBag: Set<AnyCancellable> = []

    init(owner: Book, fileData: [String: Any]? = nil) {
        book = owner
        super.init(fileData: fileData)

        for prop in [$text, $startPage, $endPage] {
            prop
                .sink { _ in
                    self.book.state.markAsChanged()
                }
                .store(in: &disposeBag)
        }

        Publishers.CombineLatest($text, $startPage)
            .debounce(for: 0.2, scheduler: RunLoop.main)
            .map { text, startPage in
                startPage.count > 0 && text.count > 0
            }
            .assign(to: \.isValid, on: self)
            .store(in: &disposeBag)
    }

    override func validate() -> ValidationStatus {
        if startPage.isEmpty {
            state.validationStatus = .emptyPage
        } else if text.isEmpty {
            state.validationStatus = .emptyQuote
        } else {
            state.validationStatus = .ok
        }
        return state.validationStatus
    }

    override func serialize() -> [String: Any] {
        var dict = super.serialize()
        dict["text"] = text
        dict["startPage"] = startPage
        dict["endPage"] = endPage
        return dict
    }

    override func deserialize() {
        super.deserialize()
        if let dict = fileData {
            text = dict["text"] as? String ?? ""
            startPage = dict["startPage"] as? String ?? ""
            endPage = dict["endPage"] as? String ?? ""

            description = "quote of book \(book.description), page \(startPage)"
            hashName = "quote" + startPage
        }

        state.markAsNotChanged()
    }

    override func show() {
        AppModel.shared.select(book)
    }

    override func remove() {
        linkColl.removeAllLinks()
    }

    override func didDestroy(_ conspectus: Conspectus) {
        linkColl.removeLink(from: conspectus)
    }

    override func store(forced: Bool = false) {
        if forced {
            book.state.markAsChanged()
        } else if !state.hasChanges {
            return
        }

        book.store()
    }
}
