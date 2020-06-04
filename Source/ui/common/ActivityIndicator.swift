//
//  ActivityIndicator.swift
//  Faustus
//
//  Created by Alexander Dittner on 04.06.2020.
//  Copyright © 2020 Alexander Dittner. All rights reserved.
//

import SwiftUI
struct ActivityIndicator: NSViewRepresentable {
    @Binding var isAnimating: Bool

    func makeNSView(context: NSViewRepresentableContext<ActivityIndicator>) -> NSProgressIndicator {
        let nsView = NSProgressIndicator()
        nsView.style = .spinning
        return nsView
    }

    func updateNSView(_ nsView: NSProgressIndicator, context: Context) {
        if isAnimating {
            nsView.startAnimation(nil)
            nsView.alphaValue = 1
        } else {
            nsView.stopAnimation(nil)
            nsView.alphaValue = 0
        }
    }
}
