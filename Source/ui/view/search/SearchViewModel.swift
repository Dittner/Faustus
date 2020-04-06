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
            return .asAuthor
        case .books:
            return .asBook
        case .tags:
            return .asTag
        case .quotes:
            return .asBook
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

        Publishers.CombineLatest3($selectedFilter, $filterText, model.bibliography.objectWillChange)
            // .debounce(for: 0.2, scheduler: RunLoop.main)
            .map { filter, _, conspectusList -> (SearchFilter, [Conspectus]) in
                if filter == .removed {
                    return (filter, conspectusList.filter { $0.isRemoved })
                } else {
                    return (filter, conspectusList.filter { !$0.isRemoved && $0.genus == filter.toGenus()! })
                }
            }
            .map { filter, conspectusList in
                if filter == .authors {
                    return conspectusList.sorted {
                        $0.asAuthor!.birthYear > $1.asAuthor!.birthYear
                    }
                }

                if filter == .books {
                    return conspectusList.sorted {
                        $0.asBook!.writtenDate > $1.asBook!.writtenDate
                    }
                }

                if filter == .tags {
                    return conspectusList.sorted {
                        $0.asTag!.name < $1.asTag!.name
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
