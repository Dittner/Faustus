//
//  LoginViewModel.swift
//  Faustus
//
//  Created by Alexander Dittner on 17.02.2020.
//  Copyright © 2020 Alexander Dittner. All rights reserved.
//

import Combine
import SwiftUI

enum SearchFilter {
    case authors
    case books
    case tags
    case quotes
    case comments
    case removed

    func toGenus() -> ConspectusGenus? {
        switch self {
        case .authors:
            return .author
        case .books:
            return .book
        case .tags:
            return .tag
        case .quotes:
            return .quote
        case .removed:
            return nil
        case .comments:
            return nil
        }
    }

    func toIcon() -> String {
        switch self {
        case .authors:
            return "author"
        case .books:
            return "book"
        case .tags:
            return "tag"
        case .quotes:
            return "quote"
        case .removed:
            return "remove"
        case .comments:
            return "comment"
        }
    }
}

final class SearchViewModel: ViewModel {
    @Published var selectedFilter: SearchFilter = .authors
    @Published var filterText: String = ""
    @Published var startToFilterFlag: Bool = true
    @Published var result: [Conspectus] = []
    @Published var pageContent: [Conspectus] = []
    @Published var curPage: Int = 0
    @Published var totalPages: Int = 0
    let pageSize: Int = 20

    private var disposeBag: Set<AnyCancellable> = []

    init() {
        logInfo(tag: .APP, msg: "SearchViewModel init")

        $filterText
            .dropFirst()
            .sink { _ in
                self.startToFilterFlag = false
            }.store(in: &disposeBag)

        $result
            .dropFirst()
            .sink { list in
                self.curPage = 0
                self.totalPages = Int((Double(list.count) / Double(self.pageSize)).rounded(.up))
            }.store(in: &disposeBag)

        Publishers.CombineLatest3($selectedFilter, $startToFilterFlag.filter { $0 != false }, model.bibliography.objectWillChange)
            .debounce(for: 0.2, scheduler: RunLoop.main)
            .map { filter, _, conspectusList -> (SearchFilter, String, [Conspectus]) in
                if filter == .removed {
                    return (filter, self.filterText, conspectusList.filter { $0.state.isRemoved })
                } else {
                    return (filter, self.filterText, conspectusList.filter { !$0.state.isRemoved && $0.genus == filter.toGenus()! })
                }
            }
            .map { filter, filterText, conspectusList -> (SearchFilter, [Conspectus]) in
                if filter == .quotes {
                    return filterText.count > 2 ? (filter, conspectusList.filter { $0.getDescription().hasSubstring(filterText) }) : (filter, [])
                } else {
                    return filterText.isEmpty ? (filter, conspectusList) : (filter, conspectusList.filter { $0.getDescription().hasSubstring(filterText) })
                }
            }
            .map { filter, conspectusList in
                if filter == .authors {
                    return conspectusList.sorted {
                        ($0 as! Author).content.birthYear > ($1 as! Author).content.birthYear
                    }
                }

                if filter == .books {
                    return conspectusList.sorted {
                        ($0 as! Book).content.writtenDate > ($1 as! Book).content.writtenDate
                    }
                }

                if filter == .tags {
                    return conspectusList.sorted {
                        ($0 as! Tag).content.name < ($1 as! Tag).content.name
                    }
                }

                if filter == .removed || filter == .quotes {
                    return conspectusList.sorted {
                        $0.state.changedTime > $1.state.changedTime
                    }
                }

                return conspectusList
            }
            .assign(to: \.result, on: self)
            .store(in: &disposeBag)

        Publishers.CombineLatest($result, $curPage.removeDuplicates())
            .map { result, curPage in
                if result.count <= self.pageSize {
                    return result
                } else {
                    let endPos = min((curPage + 1) * self.pageSize, result.count)
                    return Array(result[(curPage * self.pageSize) ..< endPos])
                }
            }
            .assign(to: \.pageContent, on: self)
            .store(in: &disposeBag)
    }

    func select(conspectus: Conspectus) {
        if let q = conspectus as? Quote {
            q.book.quoteColl.selectQuote(q)
            if selectedFilter == .quotes && filterText.count > 0 {
                q.book.quotesFilter = filterText
            }
            model.select(q.book)
        } else {
            model.select(conspectus)
        }
    }

    func nextPage() {
        if curPage < totalPages - 1 {
            curPage += 1
        }
    }

    func prevPage() {
        if curPage > 0 {
            curPage -= 1
        }
    }
}
