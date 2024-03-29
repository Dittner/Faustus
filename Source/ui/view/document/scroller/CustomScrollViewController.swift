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
            storeDebouncer.debounce {
                self.checkInNeedToUpdateScrollPosition()
            }
        }
    }

    var storeDebouncer: Debouncer = Debouncer(seconds: 0.1)
    var lastContentHeight: CGFloat = 0
    func checkInNeedToUpdateScrollPosition() {
        let difference = lastContentHeight - contentHeight
        lastContentHeight = contentHeight
        if animateWhenContentHeightIsChanging {
            withAnimation(.easeInOut(duration: 0.5)) {
                updateScrollPosition(with: difference / scrollFactor)
                animateWhenContentHeightIsChanging = false
            }
        }
    }

    @Published var windowHeight: CGFloat = CGFloat.zero {
        didSet {
            if contentHeight < windowHeight {
                scrollPosition = CGFloat.zero
            }
        }
    }

    @Published var scrollPosition = CGFloat.zero
    @Published var scaleY: CGFloat = 1
    @Published var owner: Conspectus!
    public var animateWhenContentHeightIsChanging: Bool = false

    let scrollFactor: CGFloat = 15
    static var scrollPositionCache: [UID: CGFloat] = [:]

    private var disposeBag: Set<AnyCancellable> = []

    init() {
        owner = model.selectedConspectus
        Publishers.CombineLatest($contentHeight, $windowHeight)
            .map { contentHeight, windowHeight in
                contentHeight > 0 ? min(1, windowHeight / contentHeight) : 1
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
            }
            .store(in: &disposeBag)

        NotificationCenter.default.addObserver(self, selector: #selector(onDidWheelScroll(_:)), name: .didWheelScroll, object: nil)
    }

    @objc func onDidWheelScroll(_ notification: Notification) {
        guard let event = notification.object as? NSEvent else { return }
        guard let windowFrame = (NSApplication.shared.delegate as! AppDelegate).window?.frame else { return }

        let sidePanelWidth = (windowFrame.width - Constants.docViewAndScrollerWidth) / 2
        if event.locationInWindow.x > sidePanelWidth && event.locationInWindow.x < sidePanelWidth + Constants.docViewWidth && event.locationInWindow.y < windowFrame.height - Constants.docViewHeaderHeight {
            updateScrollPosition(with: event.deltaY)
        }
    }

    func updateScrollPosition(with offset: CGFloat) {
        let maxScrollOffset = windowHeight - contentHeight
        if maxScrollOffset > 0 {
            scrollPosition = CGFloat.zero
        } else if scrollPosition + offset * scrollFactor > 0 {
            scrollPosition = CGFloat.zero
        } else if scrollPosition + offset * scrollFactor < maxScrollOffset {
            scrollPosition = maxScrollOffset
        } else {
            scrollPosition += offset * scrollFactor
        }
    }

    func update(_ conspectus: Conspectus) {
        owner = conspectus
        if let cachedPosition = CustomScrollViewController.scrollPositionCache[owner.id] {
            scrollPosition = cachedPosition
            owner = conspectus
        } else {
            scrollPosition = 0
        }
    }

    //
    // handlers
    //

    func onScrolled(_ deltaY: CGFloat) {
        updateScrollPosition(with: deltaY)
    }

    func onClicked(_ ration: CGFloat) {
        if windowHeight < contentHeight {
            let maxPos = windowHeight - contentHeight
            let pos = -ration * windowHeight / scaleY
            withAnimation {
                scrollPosition = maxPos > pos ? maxPos : pos
            }
        }
    }

    var startLocationPosY: CGFloat = 0
    var thumbDownOffset: CGFloat = 0
    func onDragged(_ value: DragGesture.Value) {
        if windowHeight < contentHeight {
            let maxPos = windowHeight - contentHeight
            if startLocationPosY != value.startLocation.y {
                startLocationPosY = value.startLocation.y
                thumbDownOffset = value.startLocation.y + scrollPosition * scaleY
            }
            let pos = (thumbDownOffset - value.location.y) / scaleY
            withAnimation {
                scrollPosition = maxPos > pos ? maxPos : pos > 0 ? 0 : pos
            }
        }
    }
}
