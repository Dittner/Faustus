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
    let scrollerController:CustomScrollViewController
    
    var book: Book!
    @Published var searchText: String = ""
    @Published var quotes: [Quote] = []
    @Published var selectedQuote: Quote?

    var quotesFilterPublisher: AnyCancellable?
    var selectedQuoteIndexPublisher: AnyCancellable?
    
    init(scrollerController: CustomScrollViewController) {
        self.scrollerController = scrollerController
    }

    func update(_ conspectus: Conspectus) {
        if let b = conspectus as? Book {
            book = b
            quotes = b.quoteColl.quotes

            quotesFilterPublisher?.cancel()
            quotesFilterPublisher = book.$quotesFilter
                .debounce(for: 1, scheduler: RunLoop.main)
                .sink { filter in

                    if filter.count >= 3 {
                        self.quotes = self.book.quoteColl.quotes.filter { $0.getDescription().hasSubstring(filter) }
                        self.book.quoteColl.selectedQuoteIndex = "1"
                    } else {
                        self.quotes = self.book.quoteColl.quotes
                    }

                    self.searchText = filter
                }

            selectedQuoteIndexPublisher?.cancel()
            selectedQuoteIndexPublisher = book.quoteColl.$selectedQuoteIndex
                .map { value in
                    let index = Int(value) ?? 0
                    return index > 0 ? index - 1 : 0
                }
                .sink { index in
                    self.selectedQuote = index < self.quotes.count ? self.quotes[index] : nil
                }
        }
    }

    func showNextQuote() {
        guard let q = selectedQuote, q.isValid else {return}
        
        if let curInd = Int(book.quoteColl.selectedQuoteIndex), curInd < quotes.count {
            book.quoteColl.selectedQuoteIndex = (curInd + 1).description
            scrollerController.scrollPosition = 0
        }
    }

    func showPrevQuote() {
        guard let q = selectedQuote, q.isValid else {return}
        
        if let curInd = Int(book.quoteColl.selectedQuoteIndex), curInd > 1 {
            book.quoteColl.selectedQuoteIndex = (curInd - 1).description
        }
    }

    var chooseBooksPublisher: AnyCancellable?
    func createQuote() {
        guard let q = selectedQuote, q.isValid else {return}
        
        book.quoteColl.createQuote()
        quotes = book.quoteColl.quotes
        book.quotesFilter = ""
        book.quoteColl.selectedQuoteIndex = "1"
    }
    
    func isSelectedQuoteFirst() -> Bool {
        book.quoteColl.selectedQuoteIndex == "1"
    }
    
    func isSelectedQuoteLast() -> Bool {
        book.quoteColl.selectedQuoteIndex == book.quoteColl.quotes.count.description
    }

    func removeQuote(_ q: Quote) {
        book.quoteColl.removeQuote(q)
        quotes = book.quoteColl.quotes
    }

    func formatQuoteText(_ q: Quote) {
        q.text = q.text.replacingOccurrences(of: "\n", with: " ")
    }
}
