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

struct MultilineInput: View {
    @EnvironmentObject var modalViewObservable: ModalViewObservable
    @ObservedObject private var notifier = HeightDidChangeNotifier()
    @Binding var text: String
    public let width: CGFloat
    public let textColor: NSColor
    public let font: NSFont
    public let isEditing: Bool
    public var minHeight: CGFloat = 60
    public var horizontalPadding: CGFloat = 0
    public var highlightedText: String = ""
    public var fontLineHeight: CGFloat = 30
    public var firstLineHeadIndent: CGFloat = 0
    public var onSelectionChange: ((_ range: NSRange) -> Void)? = nil
    public var onBeginTyping: (() -> Void)? = nil
    public var onEndTyping: (() -> Void)? = nil

    var body: some View {
        TextArea(text: $text, height: $notifier.height, width: width, textColor: textColor, font: font, isEditable: isEditing, highlightedText: highlightedText, firstLineHeadIndent: firstLineHeadIndent, lineHeight: fontLineHeight, onSelectionChange: onSelectionChange, onBeginTyping: onBeginTyping, onEndTyping: onEndTyping)
            .layoutPriority(-1)
            .saturation(0)
            .colorScheme(.light)
            .offset(x: -5, y: -1)
            .padding(.horizontal, horizontalPadding)
            .frame(width: width, height: max(minHeight - 5, notifier.height), alignment: .topLeading)
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

class HeightDidChangeNotifier: ObservableObject {
    @Published var height: CGFloat = 0
}

struct TextArea: NSViewRepresentable {
    @Binding var text: String
    @Binding var height: CGFloat
    let width: CGFloat
    let textColor: NSColor
    let font: NSFont
    let isEditable: Bool
    let highlightedText: String
    let firstLineHeadIndent: CGFloat
    let lineHeight: CGFloat?
    let onSelectionChange: ((_ range: NSRange) -> Void)?
    let onBeginTyping: (() -> Void)?
    let onEndTyping: (() -> Void)?

    func makeCoordinator() -> Coordinator {
        Coordinator(self)
    }

    func makeNSView(context: Context) -> CustomNSTextView {
        let tv = CustomNSTextView()
        tv.delegate = context.coordinator
        tv.textColor = textColor
        tv.font = font
        tv.allowsUndo = true
        tv.isEditable = isEditable
        tv.isSelectable = isEditable
        tv.defaultParagraphStyle = getStyle()
        tv.backgroundColor = NSColor.F.clear
        tv.isVerticallyResizable = false
        tv.canDrawSubviewsIntoLayer = true
        tv.string = "Ag"
        return tv
    }

    func getStyle() -> NSMutableParagraphStyle {
        let style = NSMutableParagraphStyle()
        style.alignment = .left
        style.firstLineHeadIndent = firstLineHeadIndent
        style.lineBreakMode = .byWordWrapping
        style.lineSpacing = 0

        if let lineHeight = lineHeight {
            style.minimumLineHeight = lineHeight
            style.maximumLineHeight = lineHeight
            style.lineHeightMultiple = lineHeight
        }

        return style
    }

    func updateNSView(_ textArea: CustomNSTextView, context: Context) {
        textArea.isEditable = isEditable
        textArea.isSelectable = isEditable
        // need update parent, otherwise will be updated text from prev binding
        context.coordinator.parent = self
        if textArea.curHighlightedText != highlightedText {
            textArea.curHighlightedText = highlightedText
        }

        let updatedText: String = isEditable ? text : text.replacingOccurrences(of: "_", with: "\u{200B}", options: NSString.CompareOptions.literal, range: nil)
        if textArea.string != updatedText {
            textArea.string = updatedText
        }

        if textArea.font != font {
            textArea.font = font
        }

        textArea.textStorage?.addAttribute(NSAttributedString.Key.font, value: font, range: NSRange(location: 0, length: text.count))
        textArea.textStorage?.addAttribute(NSAttributedString.Key.foregroundColor, value: textColor, range: NSRange(location: 0, length: text.count))
        textArea.textStorage?.addAttribute(NSAttributedString.Key.backgroundColor, value: NSColor.F.clear, range: NSRange(location: 0, length: text.count))

        let style = getStyle()

        textArea.textStorage?.addAttribute(NSAttributedString.Key.paragraphStyle, value: style, range: NSRange(location: 0, length: text.count))

        textArea.defaultParagraphStyle = style

        if !highlightedText.isEmpty {
            let ranges = text.ranges(of: highlightedText, options: .caseInsensitive)
            for r in ranges {
                textArea.textStorage?.addAttribute(NSAttributedString.Key.backgroundColor, value: NSColor.F.dark, range: NSRange(r, in: highlightedText))
                textArea.textStorage?.addAttribute(NSAttributedString.Key.foregroundColor, value: NSColor.F.white, range: NSRange(r, in: highlightedText))
            }
        }

        if text.count > 2, let regex = try? NSRegularExpression(pattern: "__(.*?)__", options: .caseInsensitive) {
            let results = regex.matches(in: text, options: [], range: NSMakeRange(0, text.count))
            results.forEach { result in
                let r = result.range
                if r.length > 1 {
                    textArea.textStorage?.addAttribute(NSAttributedString.Key.font, value: font.bold(), range: NSRange(location: r.location, length: r.length))
                }
            }
        }

        if text.count > 2, let regex = try? NSRegularExpression(pattern: "_(.*?)_", options: .caseInsensitive) {
            let results = regex.matches(in: text, options: [], range: NSMakeRange(0, text.count))
            results.forEach { result in
                let r = result.range
                if r.length > 1 {
                    textArea.textStorage?.addAttribute(NSAttributedString.Key.font, value: font.italics(), range: NSRange(location: r.location, length: r.length))
                }
            }
        }

        updateHeight(textArea)
    }

    func updateHeight(_ textArea: CustomNSTextView) {
        textArea.textContainer?.containerSize.width = width
        let updatedHeight = textArea.contentSize.height
        if height != updatedHeight {
            print("updatedHeight = ", updatedHeight)
            height = updatedHeight
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
            guard let textView = notification.object as? CustomNSTextView else { return }
            parent.text = textView.string
        }
        
        func textDidBeginEditing(_ notification: Notification) {
            parent.onBeginTyping?()
        }
        
        func textDidEndEditing(_ notification: Notification) {
            parent.onEndTyping?()
        }

        func textView(_ textView: NSTextView, willChangeSelectionFromCharacterRange oldSelectedCharRange: NSRange, toCharacterRange newSelectedCharRange: NSRange) -> NSRange {
            parent.onSelectionChange?(newSelectedCharRange)
            return newSelectedCharRange
        }
    }
}

class CustomNSTextView: NSTextView {
    var curHighlightedText: String = ""

    override func paste(_ sender: Any?) {
        pasteAsPlainText(sender)
    }

    var contentSize: CGSize {
        guard let layoutManager = layoutManager, let textContainer = textContainer else {
            return .zero
        }

        layoutManager.ensureLayout(for: textContainer)
        return layoutManager.usedRect(for: textContainer).size
    }
}
