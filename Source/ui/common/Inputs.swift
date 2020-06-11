//
//  Inputs.swift
//  Faustus
//
//  Created by Alexander Dittner on 27.01.2020.
//  Copyright © 2020 Alexander Dittner. All rights reserved.
//

import SwiftUI

enum FocusID: Int {
    case no
    case loginUserName
    case loginUserSurname
    case loginUserPwd
    case search
    case headerAuthorName
    case headerAuthorSurname
    case headerAuthorBirthYear
    case headerAuthorDeathYear
    case headerBookTitle
    case headerBookWritten
    case headerBookAuthor
    case bookInfoTitle
    case bookInfoSubtitle
    case bookInfoAuthor
    case bookInfoIsbn
    case bookInfoPublishDate
    case bookInfoWritten
    case bookInfoPagesCount
    case bookInfoPublisher
    case bookInfoPlace
    case modalBookChooserSearch
    case authorChooserSearch
    case linkChooserSearch
    case quoteSearch
    case quotePageStart
    case quotePageEnd
}

class TextFocus: ObservableObject {
    @Published var id: FocusID = .no
}

extension NSTextField {
    func becomeFirstResponderWithDelay() {
        DispatchQueue.main.asyncAfter(deadline: .now() + 0.02) {
            self.becomeFirstResponder()
        }
    }
}

struct TextInput: NSViewRepresentable {
    private static var focusedField: NSTextField?
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
        // print("TextInput: updateNSView \(title)")

        context.coordinator.parent = self
        nsView.isEditable = isEditable
        nsView.stringValue = text
        nsView.font = font

        if isFocused && TextInput.focusedField != nsView {
            // print("TextInput: set focus to \(title)")
            TextInput.focusedField = nsView
            nsView.becomeFirstResponderWithDelay()
        }
    }

    func makeCoordinator() -> Coordinator {
        // print("TextInput makeCoordinator, title: \(title)")
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
                } else if parent.text != textField.stringValue {
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
    static func getLineHight(fontSize: CGFloat) -> CGFloat {
        fontSize < 21 ? 1.25 : 1.5
    }

    static func getLineHightExtra(fontSize: CGFloat) -> CGFloat {
        fontSize < 21 ? 0.05 : 0
    }

    static func textHeightFrom(text: String, width: CGFloat, font: NSFont, isShown: Bool, minHeight: CGFloat = 30, firstLineHeadIndent: CGFloat) -> CGFloat {
        guard isShown else { return 0 }

        //TextInput.tf.stringValue = text.isEmpty ? "Ag" : text
        TextInput.tf.font = font
        TextInput.tf.lineBreakMode = .byWordWrapping

        let attributedStr = NSMutableAttributedString(string: text)
        attributedStr.addAttribute(NSAttributedString.Key.font, value: font, range: NSRange(location: 0, length: text.count))
        let style = TextArea.getStyle(font: font, firstLineHeadIndent: firstLineHeadIndent)
        attributedStr.addAttribute(NSAttributedString.Key.paragraphStyle, value: style, range: NSRange(location: 0, length: text.count))

        TextInput.tf.attributedStringValue = attributedStr
        
        return max(minHeight, TextInput.tf.sizeThatFits(CGSize(width: width, height: .infinity)).height * (1 + getLineHightExtra(fontSize: font.pointSize)))
    }

    @Binding var text: String
    @State private var isEnabled: Bool = false
    let textColor: NSColor
    let font: NSFont
    let isEditable: Bool
    var highlightedText: String = ""
    var firstLineHeadIndent: CGFloat
    public let onSelectionChange: ((_ range: NSRange) -> Void)?

    func makeCoordinator() -> Coordinator {
        Coordinator(self)
    }

    func makeNSView(context: Context) -> CustomNSTextView {
        print("TextArea init")
        let tv = CustomNSTextView()
        tv.delegate = context.coordinator
        tv.textColor = textColor
        tv.font = font
        tv.isEditable = isEditable
        tv.isSelectable = isEditable
        tv.allowsUndo = true
        let style = TextArea.getStyle(font: font, firstLineHeadIndent: firstLineHeadIndent)
        tv.defaultParagraphStyle = style
        tv.backgroundColor = NSColor.F.black.withAlphaComponent(0)
        tv.isVerticallyResizable = false
        tv.string = "Ag"
        return tv
    }

    static func getStyle(font: NSFont, firstLineHeadIndent: CGFloat) -> NSMutableParagraphStyle {
        let style = NSMutableParagraphStyle()
        style.alignment = .left
        style.lineHeightMultiple = TextArea.getLineHight(fontSize: font.pointSize)
        style.firstLineHeadIndent = firstLineHeadIndent
        style.lineBreakMode = .byWordWrapping

        return style
    }

    func updateNSView(_ textArea: CustomNSTextView, context: Context) {
        context.coordinator.parent = self
        textArea.isEditable = isEditable
        textArea.isSelectable = isEditable

        if textArea.string != text || textArea.curHighlightedText != highlightedText {
            textArea.curHighlightedText = highlightedText
            textArea.string = text

            let attributedStr = NSMutableAttributedString(string: text)

            attributedStr.addAttribute(NSAttributedString.Key.font, value: font, range: NSRange(location: 0, length: text.count))

            let style = TextArea.getStyle(font: font, firstLineHeadIndent: firstLineHeadIndent)

            attributedStr.addAttribute(NSAttributedString.Key.paragraphStyle, value: style, range: NSRange(location: 0, length: text.count))

            textArea.defaultParagraphStyle = style

            if !highlightedText.isEmpty {
                let ranges = text.ranges(of: highlightedText, options: .caseInsensitive)
                for r in ranges {
                    attributedStr.addAttribute(NSAttributedString.Key.backgroundColor, value: NSColor.F.dark, range: NSRange(r, in: highlightedText))
                    attributedStr.addAttribute(NSAttributedString.Key.foregroundColor, value: NSColor.F.white, range: NSRange(r, in: highlightedText))
                }
            }

            textArea.textStorage?.setAttributedString(attributedStr)
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
        
        func textView(_ textView: NSTextView, willChangeSelectionFromCharacterRange oldSelectedCharRange: NSRange, toCharacterRange newSelectedCharRange: NSRange) -> NSRange {
            parent.onSelectionChange?(newSelectedCharRange)
            return newSelectedCharRange
        }
    }

    class CustomNSTextView: NSTextView {
        var curHighlightedText: String = ""

        override func paste(_ sender: Any?) {
            pasteAsPlainText(sender)
        }
    }
}

struct MultilineInput: View {
    @EnvironmentObject var modalViewObservable: ModalViewObservable
    @Binding var text: String
    public let width: CGFloat
    public let textColor: NSColor
    public let font: NSFont
    public let isEditing: Bool
    public var highlightedText: String = ""
    public var firstLineHeadIndent: CGFloat = 0
    public var onSelectionChange: ((_ range: NSRange) -> Void)? = nil

    var body: some View {
        TextArea(text: $text, textColor: textColor, font: font, isEditable: isEditing && !modalViewObservable.isShown, highlightedText: highlightedText, firstLineHeadIndent: firstLineHeadIndent, onSelectionChange: onSelectionChange)
            .layoutPriority(-1)
            .saturation(0)
            .colorScheme(.light)
            .offset(y: -1)
            .padding(.leading, -5)
            .padding(.trailing, 0)
            .frame(width: width, height: TextArea.textHeightFrom(text: text, width: width - 5, font: font, isShown: true, firstLineHeadIndent: firstLineHeadIndent), alignment: .topLeading)
            .onTapGesture(count: 2) {
                if !self.isEditing {
                    notify(msg: "in die Zwischenablage kopiert")
                    let pasteBoard = NSPasteboard.general
                    pasteBoard.clearContents()
                    pasteBoard.setString(self.text, forType: .string)
                }
            }
    }
}
