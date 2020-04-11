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
            return .book
        case .removed:
            return nil
        }
    }
}

final class SearchViewModel: ViewModel {
    @Published var selectedFilter: SearchFilter = .authors
    @Published var filterText: String = ""
    @Published var result: [Conspectus] = []

    private var disposeBag: Set<AnyCancellable> = []

    init() {
        logInfo(tag: .APP, msg: "SearchViewModel init")

        Publishers.CombineLatest3($selectedFilter, $filterText.debounce(for: 0.5, scheduler: RunLoop.main), model.bibliography.objectWillChange)
            .map { filter, filterText, conspectusList -> (SearchFilter, String, [Conspectus]) in
                if filter == .removed {
                    return (filter, filterText, conspectusList.filter { $0.isRemoved })
                } else {
                    return (filter, filterText, conspectusList.filter { !$0.isRemoved && $0.genus == filter.toGenus()! })
                }
            }
            .map { filter, filterText, conspectusList -> (SearchFilter, [Conspectus]) in
                filterText.isEmpty ? (filter, conspectusList) : (filter, conspectusList.filter { $0.description.hasSubstring(filterText) })
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

                if filter == .removed {
                    return conspectusList.sorted {
                        $0.changedDate < $1.changedDate
                    }
                }

                return conspectusList
            }
            .assign(to: \.result, on: self)
            .store(in: &disposeBag)
    }

    func select(conspectus: Conspectus) {
        model.select(conspectus)
    }
}
