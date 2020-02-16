//
//  SelectableView.swift
//  Faustus
//
//  Created by Alexander Dittner on 07.02.2020.
//  Copyright © 2020 Alexander Dittner. All rights reserved.
//

import SwiftUI

extension View {
    func applySkin<T>(_ skin: T.Type, host:SelectableView) -> some View where T: Skin {
        return modifier(skin.init(parent: self))
    }
}

protocol Skin: ViewModifier {
    init(parent: Any)
}

struct SelectableViewSkin: Skin {
    private let _parent: SelectableView?

    init(parent: Any) {
        _parent = parent as? SelectableView
    }

    func body(content: Content) -> some View {
        if let parent = _parent {
            return content
                .background(parent.isSelected ? Color.blue : Color.black)
        } else {
            return content
                .background(Color.red)
        }
    }
}

struct SelectableView: View {
    @State var isSelected = false
    var body: some View {
        ZStack {
            Button(action: {
                print("Clicked")
                self.isSelected.toggle()
            }) {
                Text("Click me")
            }.buttonStyle(PlainButtonStyle())
        }
    }
}
