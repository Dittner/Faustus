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
    @Published var filterEnabled: Bool = false
    @Published var quotes: [Quote] = []
    @Published var selectedQuote: Quote?
    @Published var selectedQuoteIndex: String = "1"
    var quoteTextSelection: NSRange = NSRange(location: 0, length: 0)

    var quotesFilterPublisher: AnyCancellable?
    var selectedQuoteIndexPublisher: AnyCancellable?
    var selectedQuotePublisher: AnyCancellable?

    init(scrollerController: CustomScrollViewController) {
        self.scrollerController = scrollerController
    }

    func update(_ conspectus: Conspectus) {
        if let b = conspectus as? Book {
            book = b
            quotes = b.quoteColl.quotes.sorted { $0 < $1 }
            selectedQuoteIndex = (book.quoteColl.selectedQuoteIndex + 1).description

            quotesFilterPublisher?.cancel()
            quotesFilterPublisher = book.$quotesFilter
                .debounce(for: 0.5, scheduler: RunLoop.main)
                // .dropFirst()
                .sink { filter in
                    self.quotes = filter.count >= 3 ? self.book.quoteColl.quotes.filter { $0.getDescription().hasSubstring(filter) } : self.book.quoteColl.quotes
                    let selectedQuote = self.book.quoteColl.selectedQuoteIndex < self.book.quoteColl.quotes.count ? self.book.quoteColl.quotes[self.book.quoteColl.selectedQuoteIndex] : nil
                    var selectedQuoteIndex = 0
                    for (ind, quote) in self.quotes.enumerated() {
                        if quote == selectedQuote {
                            selectedQuoteIndex = ind
                            break
                        }
                    }

                    self.selectedQuoteIndex = (selectedQuoteIndex + 1).description
                    self.filterEnabled = filter.count >= 3
                }

            selectedQuoteIndexPublisher?.cancel()
            selectedQuoteIndexPublisher = $selectedQuoteIndex
                .debounce(for: 0.1, scheduler: RunLoop.main)
                .sink { index in
                    let indexInt = (Int(index) ?? 1) - 1
                    self.selectedQuote = indexInt < self.quotes.count ? self.quotes[indexInt] : nil
                    for (ind, quote) in self.book.quoteColl.quotes.enumerated() {
                        if quote == self.selectedQuote {
                            
                            if self.book.quoteColl.selectedQuoteIndex != ind {
                                self.book.quoteColl.selectedQuoteIndex = ind
                            }
                            break
                        }
                    }
                }

            selectedQuotePublisher?.cancel()
            selectedQuotePublisher = book.quoteColl.$selectedQuoteIndex
                .debounce(for: 0.1, scheduler: RunLoop.main)
                .sink { index in
                    let selectedQuote = index < self.book.quoteColl.quotes.count ? self.book.quoteColl.quotes[index] : nil

                    for (ind, quote) in self.quotes.enumerated() {
                        if quote == selectedQuote {
                            if self.selectedQuoteIndex != (ind + 1).description {
                                self.selectedQuoteIndex = (ind + 1).description
                            }
                            break
                        }
                    }
                }
        }
    }

    func showNextQuote() {
        guard let q = selectedQuote, q.isValid else { return }

        if canSelectNext() {
            selectedQuoteIndex = ((Int(selectedQuoteIndex) ?? 0) + 1).description
            scrollerController.scrollPosition = 0
        }
    }

    func showPrevQuote() {
        guard let q = selectedQuote, q.isValid else { return }

        if canSelectPrev() {
            selectedQuoteIndex = ((Int(selectedQuoteIndex) ?? 2) - 1).description
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
        selectedQuoteIndex != "1"
    }

    func canSelectNext() -> Bool {
        selectedQuoteIndex != quotes.count.description
    }

    func removeQuote(_ q: Quote) {
        book.quoteColl.removeQuote(q)
        quotes = book.quoteColl.quotes
        book.quotesFilter = ""
        if book.quoteColl.selectedQuoteIndex >= quotes.count {
            book.quoteColl.selectedQuoteIndex = quotes.count - 1
            selectedQuoteIndex = (book.quoteColl.selectedQuoteIndex + 1).description
        }
        selectedQuote = book.quoteColl.selectedQuoteIndex < quotes.count ? quotes[book.quoteColl.selectedQuoteIndex] : nil
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
    
    func removeHyphenWithSpaces(_ q: Quote) {
        q.text = TextFormatter.removeHyphenWithSpaces(q.text, selection: quoteTextSelection)
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
