//
//  CustomTextField.swift
//  Faustus
//
//  Created by Alexander Dittner on 27.01.2020.
//  Copyright © 2020 Alexander Dittner. All rights reserved.
//

import SwiftUI

struct TextInput: NSViewRepresentable {
    @Binding var text: String
    private(set) var tf: NSTextField
    private var _textColor: NSColor = NSColor.black
    private let _title: String
    private var onEnterAction: (() -> Void)?

    init(_ title: String, text: Binding<String>, textColor: NSColor, isSecure: Bool = false, onEnter: (() -> Void)? = nil) {
        _title = title
        _text = text
        onEnterAction = onEnter
        _textColor = textColor

        tf = isSecure ? NSSecureTextField(string: text.wrappedValue) : NSTextField(string: text.wrappedValue)
        tf.isBordered = false
        tf.backgroundColor = nil
        tf.focusRingType = .none
        tf.textColor = _textColor
        tf.placeholderString = _title
        tf.allowsEditingTextAttributes = false
    }

    func makeNSView(context: Context) -> NSTextField {
        tf.delegate = context.coordinator
        return tf
    }

    func updateNSView(_ nsView: NSTextField, context: Context) {
        nsView.stringValue = text
    }

    func makeCoordinator() -> Coordinator {
        Coordinator(self)
    }

    final class Coordinator: NSObject, NSTextFieldDelegate {
        var _parent: TextInput

        init(_ parent: TextInput) {
            _parent = parent
        }

        func controlTextDidChange(_ obj: Notification) {
            if let textField = obj.object as? NSTextField {
                _parent.text = textField.stringValue
            }
        }

        func controlTextDidEndEditing(_ obj: Notification) {
            _ = _parent.tf.resignFirstResponder()
        }

        func control(_ control: NSControl, textView: NSTextView, doCommandBy commandSelector: Selector) -> Bool {
            if commandSelector == #selector(NSResponder.insertNewline(_:)) {
                print("Enter")
                _parent.onEnterAction?()
            }
            return false
        }
    }
}

struct LoginTextInput: View {
    @Binding var text: String
    private let _title: String
    private let _isSecure: Bool
    private var onEnterAction: (() -> Void)?

    init(_ title: String, text: Binding<String>, isSecure: Bool, onEnter: (() -> Void)? = nil) {
        _title = title
        _text = text
        _isSecure = isSecure
        onEnterAction = onEnter
    }

    var body: some View {
        TextInput(_title, text: $text, textColor: NSColor.F.light, isSecure: _isSecure, onEnter: onEnterAction)
            .frame(minWidth: 50, idealWidth: 100, maxWidth: .infinity, minHeight: 35, idealHeight: 35, maxHeight: 35, alignment: .leading)
            .padding(.horizontal, 5)
            .background(Color.F.black)
            .cornerRadius(6)
    }
}
