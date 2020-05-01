//
//  CustomScrollViewController.swift
//  Faustus
//
//  Created by Alexander Dittner on 30.04.2020.
//  Copyright © 2020 Alexander Dittner. All rights reserved.
//

import Combine
import SwiftUI

class CustomScrollViewController: ViewModel {
    @Published var contentHeight: CGFloat = CGFloat.zero {
        didSet {
            let difference = oldValue - contentHeight
            print("difference \(difference)")
            if abs(difference) < 50 && abs(difference) > 0 {
                updateScrollPosition(with: difference / scrollFactor)
            }
        }
    }

    @Published var windowHeight: CGFloat = CGFloat.zero
    @Published var scrollPosition = CGFloat.zero
    @Published var scaleY: CGFloat = 1
    @Published var owner: Conspectus!

    let scrollFactor: CGFloat = 10
    static var scrollPositionCache: [UID: CGFloat] = [:]

    private var disposeBag: Set<AnyCancellable> = []

    init() {
        owner = model.selectedConspectus
        Publishers.CombineLatest($contentHeight, $windowHeight)
            .map { contentHeight, windowHeight in
                min(0.15, windowHeight / contentHeight)
            }
            .assign(to: \.scaleY, on: self)
            .store(in: &disposeBag)

        $scrollPosition
            .map { value in
                value.rounded()
            }
            .removeDuplicates()
            .debounce(for: 0.5, scheduler: RunLoop.main)
            .sink { value in
                CustomScrollViewController.scrollPositionCache[self.owner.id] = value
                print("     store scrollPosition to cache: \(value)")
            }
            .store(in: &disposeBag)
    }

    func updateScrollPosition(with offset: CGFloat) {
        withAnimation {
            let maxScrollOffset = windowHeight - contentHeight
            if maxScrollOffset > 0 {
                scrollPosition = 0
            } else if scrollPosition + offset * scrollFactor > 0 {
                scrollPosition = CGFloat.zero
            } else if scrollPosition + offset * scrollFactor < maxScrollOffset {
                scrollPosition = maxScrollOffset
            } else {
                scrollPosition += offset * scrollFactor
            }
        }
    }

    func update(_ conspectus: Conspectus) {
        owner = conspectus
        if let cachedPosition = CustomScrollViewController.scrollPositionCache[owner.id] {
            scrollPosition = cachedPosition
            print("     update scrollPosition from cache: \(cachedPosition)")
            owner = conspectus
        }
    }
}
