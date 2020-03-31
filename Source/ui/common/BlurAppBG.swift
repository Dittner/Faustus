//
//  CustomTextField.swift
//  Faustus
//
//  Created by Alexander Dittner on 27.01.2020.
//  Copyright © 2020 Alexander Dittner. All rights reserved.
//

import SwiftUI
struct BlurAppBG: NSViewRepresentable {
    func makeNSView(context: Context) -> NSVisualEffectView {
        let blurView = NSVisualEffectView()
        blurView.blendingMode = NSVisualEffectView.BlendingMode.behindWindow
        blurView.material = NSVisualEffectView.Material.sidebar
        blurView.state = NSVisualEffectView.State.active
        return blurView
    }

    func updateNSView(_ nsView: NSVisualEffectView, context: Context) {
        // Nothing to do.
    }
}
