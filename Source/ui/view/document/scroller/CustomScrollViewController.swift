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
            if abs(difference) < 50 && abs(difference) > 0 {
                withAnimation(.easeInOut(duration: 1.0)) {
                    updateScrollPosition(with: difference / scrollFactor)
                }
            }
        }
    }

    @Published var windowHeight: CGFloat = CGFloat.zero
    @Published var scrollPosition = CGFloat.zero
    @Published var scaleY: CGFloat = 1
    @Published var owner: Conspectus!

    let scrollFactor: CGFloat = 15
    static var scrollPositionCache: [UID: CGFloat] = [:]

    private var disposeBag: Set<AnyCancellable> = []

    init() {
        owner = model.selectedConspectus
        Publishers.CombineLatest($contentHeight, $windowHeight)
            .map { contentHeight, windowHeight in
                min(Constants.docViewMinimapWidth / Constants.docViewWidth, windowHeight / contentHeight)
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

        let sidePanelWidth = (windowFrame.width - Constants.docViewWidth - Constants.docViewMinimapWidth) / 2
        if event.locationInWindow.x > sidePanelWidth && event.locationInWindow.x < sidePanelWidth + Constants.docViewWidth && event.locationInWindow.y < windowFrame.height - Constants.docViewHeaderHeight {
            updateScrollPosition(with: event.deltaY)
        }
    }

    func updateScrollPosition(with offset: CGFloat) {
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
                scrollPosition = maxPos > pos ? maxPos : abs(pos) < windowHeight ? 0 : pos
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
                scrollPosition = maxPos > pos ? maxPos : abs(pos) < windowHeight || pos > 0 ? 0 : pos
            }
        }
    }
}
