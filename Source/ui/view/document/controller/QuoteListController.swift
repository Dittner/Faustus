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
    let scrollerController: CustomScrollViewController

    var book: Book!
    @Published var searchText: String = ""
    @Published var filterEnabled: Bool = false
    @Published var quotes: [Quote] = []
    @Published var selectedQuote: Quote?
    @Published var selectedQuoteIndex: String = "1"
    var quoteTextSelection: NSRange = NSRange(location: 0, length: 0)

    var quotesFilterPublisher: AnyCancellable?
    var selectedQuoteIndexPublisher: AnyCancellable?

    init(scrollerController: CustomScrollViewController) {
        self.scrollerController = scrollerController
    }

    func update(_ conspectus: Conspectus) {
        if let b = conspectus as? Book {
            book = b
            quotes = b.quoteColl.quotes.sorted { $0 < $1 }

            quotesFilterPublisher?.cancel()
            quotesFilterPublisher = book.$quotesFilter
                .debounce(for: 1, scheduler: RunLoop.main)
                .dropFirst()
                .sink { filter in

                    if filter.count >= 3 {
                        self.quotes = self.book.quoteColl.quotes.filter { $0.getDescription().hasSubstring(filter) }
                        self.book.quoteColl.selectedQuoteIndex = 0
                        self.selectedQuoteIndex = "1"
                    } else {
                        self.quotes = self.book.quoteColl.quotes
                    }

                    self.searchText = filter
                }

            selectedQuoteIndex = (book.quoteColl.selectedQuoteIndex + 1).description
            selectedQuoteIndexPublisher?.cancel()
            selectedQuoteIndexPublisher = $selectedQuoteIndex
                .map { value -> Int in
                    let index = Int(value) ?? 0
                    return index > 0 ? index - 1 : 0
                }
                .sink { index in
                    self.book.quoteColl.selectedQuoteIndex = index
                    self.selectedQuote = index < self.quotes.count ? self.quotes[index] : nil
                }
        }
    }

    func showNextQuote() {
        guard let q = selectedQuote, q.isValid else { return }

        if book.quoteColl.selectedQuoteIndex < quotes.count - 1 {
            book.quoteColl.selectedQuoteIndex += 1
            selectedQuoteIndex = (book.quoteColl.selectedQuoteIndex + 1).description
            scrollerController.scrollPosition = 0
        }
    }

    func showPrevQuote() {
        guard let q = selectedQuote, q.isValid else { return }

        if book.quoteColl.selectedQuoteIndex > 0 {
            book.quoteColl.selectedQuoteIndex -= 1
            selectedQuoteIndex = (book.quoteColl.selectedQuoteIndex + 1).description
            scrollerController.scrollPosition = 0
        }
    }

    var chooseBooksPublisher: AnyCancellable?
    func createQuote() {
        if let q = selectedQuote, !q.isValid { return }

        book.quoteColl.createQuote()
        quotes = book.quoteColl.quotes
        book.quotesFilter = ""
        book.quoteColl.selectedQuoteIndex = 0
        selectedQuoteIndex = "1"
        scrollerController.scrollPosition = 0
    }

    func canSelectPrev() -> Bool {
        book.quoteColl.selectedQuoteIndex > 0
    }

    func canSelectNext() -> Bool {
        book.quoteColl.selectedQuoteIndex < quotes.count - 1
    }

    func removeQuote(_ q: Quote) {
        book.quoteColl.removeQuote(q)
        quotes = book.quoteColl.quotes
        book.quotesFilter = ""
        if book.quoteColl.selectedQuoteIndex >= quotes.count {
            book.quoteColl.selectedQuoteIndex = quotes.count - 1
            selectedQuoteIndex = (book.quoteColl.selectedQuoteIndex + 1).description
        }
        selectedQuote = book.quoteColl.selectedQuoteIndex < quotes.count ? self.quotes[book.quoteColl.selectedQuoteIndex] : nil
        scrollerController.scrollPosition = 0
    }

    func formatQuoteText(_ q: Quote) {
        var res = ""
        res = TextFormatter.removeSpaceDuplicates(q.text, selection: quoteTextSelection)
        res = TextFormatter.replaceHyphenWithDash(res, selection: quoteTextSelection)
        res = TextFormatter.removeWordWrapping(res, selection: quoteTextSelection)
        q.text = res
    }
    
    func removeSpaceDuplicates(_ q: Quote) {
        q.text = TextFormatter.removeSpaceDuplicates(q.text, selection: quoteTextSelection)
    }
    
    func replaceHyphenWithDash(_ q: Quote) {
        q.text = TextFormatter.replaceHyphenWithDash(q.text, selection: quoteTextSelection)
    }
    
    func removeWordWrapping(_ q: Quote) {
        q.text = TextFormatter.removeWordWrapping(q.text, selection: quoteTextSelection)
    }
    
    func sortQuotes() {
        book.quoteColl.quotes = book.quoteColl.quotes.sorted { $0 < $1 }
        quotes = book.quoteColl.quotes
        book.quotesFilter = ""
        book.quoteColl.selectedQuoteIndex = 0
        selectedQuoteIndex = "1"
        scrollerController.scrollPosition = 0
    }
}
