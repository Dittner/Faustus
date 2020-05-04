//
//  NetworkManager.swift
//  Faustus
//
//  Created by Alexander Dittner on 04.05.2020.
//  Copyright © 2020 Alexander Dittner. All rights reserved.
//

import Combine
import SwiftUI

class NetworkManager {
    static func loadBookInfo(isbn: String) -> AnyPublisher<BookData?, Never> {
        let p = Future<BookData?, Never> { promise in
            guard let url = URL(string: "https://www.googleapis.com/books/v1/volumes?q=isbn:" + isbn) else { promise(.success(nil)); return }

            URLSession.shared.dataTask(with: url) { data, _, _ in
                guard let data = data else { promise(.success(nil)); return }
                guard let json = JSONParser(data: data) else { promise(.success(nil)); return }
                
                var b = BookData()
                b.publishedDate = json["items"]["volumeInfo"]["publishedDate"].value as? String ?? ""
                b.subtitle = json["items"]["volumeInfo"]["subtitle"].value as? String ?? ""
                b.pageCount = json["items"]["volumeInfo"]["pageCount"].value as? Int
                b.authors = json["items"]["volumeInfo"]["authors"].value as? [String] ?? []
                b.description = json["items"]["volumeInfo"]["authors"].value as? String ?? ""

                promise(.success(b))

            }.resume()
        }
        return p.eraseToAnyPublisher()
    }
}

public enum MyJSONType: Int {
    case number
    case string
    case bool
    case array
    case dictionary
    case null
    case unknown
}

struct JSONValue {
    var value: Any?
    var dict: [String: JSONValue]?

    init(value: Any) {
        self.value = value
    }

    init(dict: [String: JSONValue]) {
        self.dict = dict
    }

    init() {}

    subscript(key: String) -> JSONValue {
        if let dict = dict, let subJsonValue = dict[key] {
            return subJsonValue
        } else {
            return JSONValue()
        }
    }
}

class JSONParser {
    public init?(data: Data, options opt: JSONSerialization.ReadingOptions = []) {
        guard let json = try? JSONSerialization.jsonObject(with: data, options: []) as? [String: Any] else { return nil }
        value = JSONValue(dict: [:])
        parseObject(json, &value)
    }

    private(set) var value: JSONValue

    private func parseObject(_ dict: [String: Any], _ parent: inout JSONValue) {
        for (key, value) in dict {
            if let values = value as? [String: Any] {
                var d = JSONValue(dict: [:])
                parseObject(values, &d)
                parent.dict![key] = d
            } else if let values = value as? [Any] {
                var d = JSONValue(dict: [:])
                for subValue in values {
                    if let subValueDict = subValue as? [String: Any] {
                        parseObject(subValueDict, &d)
                    }
                }

                if d.dict!.values.count > 0 {
                    parent.dict![key] = d
                } else {
                    parent.dict![key] = JSONValue(value: value)
                }
            } else {
                parent.dict![key] = JSONValue(value: value)
            }
        }
    }

    subscript(key: String) -> JSONValue {
        return value[key]
    }
}

struct BookData {
    var subtitle: String = ""
    var publishedDate: String = ""
    var pageCount: Int?
    var description: String = ""
    var authors: [String] = []
}
