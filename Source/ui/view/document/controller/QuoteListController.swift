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
    var book: Book!
    @Published var searchText: String = ""
    @Published var quotes: [Quote] = []
    @Published var isExpanded: Bool = true

    var quotesFilterPublisher: AnyCancellable?

    func update(_ conspectus: Conspectus) {
        if let b = conspectus as? Book {
            book = b
            quotes = b.quoteColl.quotes

            quotesFilterPublisher?.cancel()
            quotesFilterPublisher = book.$quotesFilter
                .debounce(for: 1, scheduler: RunLoop.main)
                .sink { filter in
                    self.quotes = filter.count < 3 ? self.book.quoteColl.quotes : self.book.quoteColl.quotes.filter { $0.getDescription().hasSubstring(filter)
                    }

                    self.searchText = filter
                }
        }
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

    func formatQuoteText(_ q: Quote) {
        q.text = q.text.replacingOccurrences(of: "\n", with: " ")
    }
}
