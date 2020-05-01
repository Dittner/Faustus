//
//  CustomScrollViewController.swift
//  Faustus
//
//  Created by Alexander Dittner on 30.04.2020.
//  Copyright © 2020 Alexander Dittner. All rights reserved.
//

import Combine
import SwiftUI

struct CustomScrollView<Content>: View where Content: View {
    @ObservedObject var controller: CustomScrollViewController

    let content: Content

    init(controller: CustomScrollViewController, @ViewBuilder content: () -> Content) {
        self.controller = controller
        self.content = content()
    }

    var body: some View {
        GeometryReader { window in

            HStack(alignment: .top, spacing: 0) {
                self.content
                    .modifier(ViewHeightKey())
                    .onPreferenceChange(ViewHeightKey.self) { self.controller.contentHeight = $0; self.controller.windowHeight = window.size.height }
                    .frame(width: 1000, height: window.size.height, alignment: .topLeading)
                    .offset(y: self.controller.scrollPosition)
                    .clipped()

                ZStack(alignment: .topLeading) {
                    Separator(color: Color(self.controller.owner.genus).opacity(0.25), width: 1, height: .infinity)

                    self.content.frame(width: 1000, height: window.size.height, alignment: .topLeading)
                        .scaleEffect(x: 0.15, y: self.controller.scaleY, anchor: .topLeading)

                    Color(self.controller.owner.genus).opacity(0.25)
                        .frame(width: 150, height: window.size.height * self.controller.scaleY)
                        .offset(y: -self.controller.scrollPosition * self.controller.scaleY)

                    MouseWheelDetector(onScrolled: self.onScrolled, onClicked: self.onClicked)

                }.frame(width: 150, height: window.size.height, alignment: .topLeading)
            }
        }
    }

    func onScrolled(_ deltaY: CGFloat) {
        controller.updateScrollPosition(with: deltaY)
    }

    func onClicked(_ ration: CGFloat) {
        let maxPos = controller.windowHeight - controller.contentHeight
        let pos = -ration * controller.contentHeight
        withAnimation {
            controller.scrollPosition = maxPos > pos ? maxPos : abs(pos) < controller.windowHeight ? 0 : pos
        }
    }
}

struct ViewHeightKey: PreferenceKey {
    static var defaultValue: CGFloat { 0 }
    static func reduce(value: inout Value, nextValue: () -> Value) {
        value = value + nextValue()
    }
}

extension ViewHeightKey: ViewModifier {
    func body(content: Content) -> some View {
        return content.background(GeometryReader { proxy in
            Color.clear.preference(key: Self.self, value: proxy.size.height)
        })
    }
}

struct MouseWheelDetector: NSViewRepresentable {
    public let onScrolled: (_ deltaY: CGFloat) -> Void
    public let onClicked: (_ ration: CGFloat) -> Void

    func updateNSView(_ nsView: MouseWheelDetectorView, context: Context) {
        nsView.parent = self
    }

    func makeNSView(context: Context) -> MouseWheelDetectorView {
        let view = MouseWheelDetectorView()
        view.parent = self
        return view
    }
}

class MouseWheelDetectorView: NSView {
    var parent: MouseWheelDetector!

    override func scrollWheel(with event: NSEvent) {
        parent?.onScrolled(event.deltaY)
    }

    override func mouseDown(with event: NSEvent) {
        let ration = bounds.height == 0 ? 0 : (bounds.height - event.locationInWindow.y) / bounds.height
        parent?.onClicked(ration)
    }
}
