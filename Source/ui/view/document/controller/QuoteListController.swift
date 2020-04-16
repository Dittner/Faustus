//
//  QuoteListController.swift
//  Faustus
//
//  Created by Alexander Dittner on 16.04.2020.
//  Copyright © 2020 Alexander Dittner. All rights reserved.
//

import Combine
import SwiftUI

class QuoteListController: ViewModel {
    @Published var book: Book!
    @Published var quotes: [Quote] = []

    func update(with book: Book) {
        self.book = book
        quotes = book.quoteColl.quotes
    }

    var chooseBooksPublisher: AnyCancellable?
    func createQuote() {
        book.quoteColl.createQuote()
        quotes = book.quoteColl.quotes
    }

    func removeQuote(_ q: Quote) {
        book.quoteColl.removeQuote(q)
        quotes = book.quoteColl.quotes
    }
}
