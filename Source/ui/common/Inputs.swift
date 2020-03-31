//
//  Inputs.swift
//  Faustus
//
//  Created by Alexander Dittner on 27.01.2020.
//  Copyright © 2020 Alexander Dittner. All rights reserved.
//

import SwiftUI

extension NSTextField {
    func becomeFirstResponderWithDelay() {
        DispatchQueue.main.asyncAfter(deadline: .now() + 0.05) {
            self.becomeFirstResponder()
        }
    }
}

struct TextInput: NSViewRepresentable {
    private static var focusedField:NSTextField? = nil
    public static let tf: NSTextField = NSTextField()
    
    public let title: String
    @Binding var text: String
    public let textColor: NSColor
    public let font: NSFont
    public let alignment: NSTextAlignment
    public var isFocused: Bool

    public let isSecure: Bool
    public let format: String?
    public let isEditable: Bool
    public let onEnterAction: (() -> Void)?
    

    func makeNSView(context: Context) -> NSTextField {
        let tf = isSecure ? NSSecureTextField() : NSTextField()
        tf.isBordered = false
        tf.backgroundColor = nil
        tf.focusRingType = .none
        tf.textColor = textColor
        tf.placeholderString = title
        tf.allowsEditingTextAttributes = false
        tf.alignment = alignment
        tf.isEditable = isEditable
        tf.delegate = context.coordinator

        return tf
    }

    func updateNSView(_ nsView: NSTextField, context: Context) {
        context.coordinator.parent = self
        nsView.isEditable = isEditable
        nsView.stringValue = text
        nsView.font = font
        
        if isFocused && TextInput.focusedField != nsView {
            TextInput.focusedField = nsView
            nsView.becomeFirstResponderWithDelay()
        }
    }

    func makeCoordinator() -> Coordinator {
        //print("TextInput makeCoordinator, title: \(title)")
        return Coordinator(self)
    }

    class Coordinator: NSObject, NSTextFieldDelegate {
        var parent: TextInput

        init(_ parent: TextInput) {
            self.parent = parent
        }

        func controlTextDidChange(_ obj: Notification) {
            if let textField = obj.object as? NSTextField {
                if let format = parent.format, textField.stringValue.count > 0, !textField.stringValue.matches(predicate: format.asPredicate) {
                    textField.stringValue = parent.text
                } else {
                    parent.text = textField.stringValue
                }
            }
        }
        
        func control(_ control: NSControl, textView: NSTextView, doCommandBy commandSelector: Selector) -> Bool {
            if commandSelector == #selector(NSResponder.insertNewline(_:)) {
                parent.onEnterAction?()
            }
            return false
        }
    }
}

struct TextArea: NSViewRepresentable {
    static func textHeightFrom(text: String, width: CGFloat, font: NSFont, isShown:Bool) -> CGFloat {
        guard isShown else {return 0}
        
        TextInput.tf.stringValue = text
        TextInput.tf.font = font
        TextInput.tf.lineBreakMode = .byWordWrapping
        return max(30, TextInput.tf.sizeThatFits(CGSize(width: width, height: .infinity)).height) * 1.04
    }
    
    @Binding var text: String
    let textColor: NSColor
    let font: NSFont
    let isEditable: Bool

    func makeCoordinator() -> Coordinator {
        Coordinator(self)
    }

    func makeNSView(context: Context) -> NSTextView {
        print("TextArea init")
        let tv = NSTextView()
        tv.delegate = context.coordinator
        tv.textColor = textColor
        tv.font = font
        tv.isEditable = isEditable
        tv.isSelectable = isEditable
        tv.allowsUndo = true
        tv.backgroundColor = NSColor.F.black.withAlphaComponent(0)
        return tv
    }

    func updateNSView(_ textArea: NSTextView, context: Context) {
        textArea.isEditable = isEditable
        textArea.isSelectable = isEditable
        if textArea.string != text {
            textArea.string = text
        }
    }

    class Coordinator: NSObject, NSTextViewDelegate {
        var parent: TextArea

        init(_ textArea: TextArea) {
            parent = textArea
        }

        func textView(_ textView: NSTextView, shouldChangeTextIn affectedCharRange: NSRange, replacementString: String?) -> Bool {
            return true
        }

        func textDidChange(_ notification: Notification) {
            guard let textView = notification.object as? NSTextView else { return }
            parent.text = textView.string
        }
    }
}
