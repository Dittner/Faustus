//
//  TextStyle.swift
//  Faustus
//
//  Created by Alexander Dittner on 14.05.2020.
//  Copyright © 2020 Alexander Dittner. All rights reserved.
//

import SwiftUI

public struct StyledText: View {
    public init(verbatim content: String, styles: [TextStyle] = []) {
        let attributes = styles.reduce(into: [:]) { result, style in
            result[style.key] = style
        }
        attributedString = NSMutableAttributedString(string: content, attributes: attributes)
    }

    private var attributedString: NSAttributedString
    private init(attributedString: NSAttributedString) {
        self.attributedString = attributedString
    }

    public var body: some View {
        var text: Text = Text(verbatim: "")
        attributedString
            .enumerateAttributes(in: NSRange(location: 0, length: attributedString.length),
                                 options: []) { attributes, range, _ in
                let string = attributedString.attributedSubstring(from: range).string
                let modifiers = attributes.values.map { $0 as! TextStyle }
                text = text + modifiers.reduce(Text(verbatim: string)) { segment, style in
                    style.apply(segment)
                }
            }
        return text
    }

    public func style(_ style: TextStyle) -> StyledText {
        let newAttributedString = NSMutableAttributedString(attributedString: attributedString)

        let indexes = attributedString.string.indexesOf(string: style.substring)
        for ind in indexes {
            let nsRange = NSRange(location: ind, length: style.substring.count)
            newAttributedString.addAttribute(style.key, value: style, range: nsRange)
        }

        return StyledText(attributedString: newAttributedString)
    }
}

public struct TextStyle {
    static func foregroundColor(_ color: Color, _ substring: String) -> TextStyle {
        TextStyle(key: NSAttributedString.Key.foregroundColor, substring: substring, apply: { $0.foregroundColor(color) })
    }

    static func bold(_ substring: String) -> TextStyle {
        TextStyle(key: .init("TextStyleBold"), substring: substring, apply: { $0.bold() })
    }

    internal let key: NSAttributedString.Key
    internal let apply: (Text) -> Text
    internal let substring: String

    init(key: NSAttributedString.Key, substring: String, apply: @escaping (Text) -> Text) {
        self.key = key
        self.substring = substring
        self.apply = apply
    }
}

extension TextStyle {
    static func highlight(_ str: String) -> TextStyle { .foregroundColor(.red, str) }
}
