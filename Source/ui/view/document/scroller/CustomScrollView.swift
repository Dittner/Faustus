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
    @ObservedObject var vm: DocViewModel

    let content: Content

    init(controller: CustomScrollViewController, vm: DocViewModel, @ViewBuilder content: () -> Content) {
        self.controller = controller
        self.vm = vm
        self.content = content()
    }

    var body: some View {
        GeometryReader { window in
            self.content
                .modifier(ViewHeightKey())
                .onPreferenceChange(ViewHeightKey.self) { self.controller.contentHeight = $0; self.controller.windowHeight = window.size.height }
                .frame(width: Constants.docViewWidth, height: window.size.height, alignment: .topLeading)
                .offset(y: self.controller.scrollPosition)
                .clipped()

            ZStack(alignment: .topLeading) {
                DocViewContent(self.vm, changeInputsWithText: true)
                    .frame(width: Constants.docViewWidth, height: window.size.height, alignment: .topTrailing)
                    .scaleEffect(x: Constants.docViewMinimapWidth / Constants.docViewWidth, y: self.controller.scaleY, anchor: .topLeading)
                    .allowsHitTesting(false)

                MouseWheelDetector(onScrolled: self.controller.onScrolled, onClicked: self.controller.onClicked)

                Color(self.controller.owner.genus).opacity(0.25)
                    .allowsHitTesting(true)
                    .frame(width: Constants.docViewMinimapWidth, height: window.size.height * self.controller.scaleY)
                    .offset(y: -self.controller.scrollPosition * self.controller.scaleY)
                    .gesture(DragGesture().onChanged { value in
                        self.controller.onDragged(value)
                    })

                Separator(color: Color.F.black025, width: 1, height: window.size.height)
            }.frame(width: Constants.docViewMinimapWidth, height: window.size.height, alignment: .topLeading)
                .offset(x: Constants.docViewWidth)
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
    public var onClicked: ((_ ration: CGFloat) -> Void)?

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
        parent?.onClicked?(ration)
    }
}
