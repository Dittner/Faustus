import Combine
import CryptoKit
import Foundation
import SwiftUI

// let inputString = "Hello, world!"
// let inputData = Data(inputString.utf8)
// let hash = SHA512.hash(data: inputData).compactMap { String(format: "%02x", $0) }.joined()
// print(hash)
//
// let bits = SHA256.hash(data: "Some password".data(using: .utf8)!)
// let key = SymmetricKey(data: bits)
//
// var documentsURL: URL = FileManager.default.urls(for: .documentDirectory, in: .userDomainMask).first!
// var projectURL: URL = documentsURL.appendingPathComponent("Faustus/logs")
//
// var isDir: ObjCBool = true
// if FileManager.default.fileExists(atPath: projectURL.path, isDirectory: &isDir) {
//    print(isDir.boolValue ? "Directory exists" : "File exists")
// } else {
//    print("File does not exist")
// }


let str = " John   Fitzgerald Kennedi "
let initials = str.components(separatedBy: " ")
    .filter { $0 != "" }
    .map { value in
        String(value.first!) + "."

    }
.reduce("") { $0 + $1 }

print("substrings = \(initials)")

var arr = ["Adam"]
arr.append("Jonny")
arr.append(contentsOf: ["Eva", "Silke"])
arr += ["Smit", "Ditter"]
print("arr = \(arr)")

class A {
    var id:String = "123"
}
class B {
    var a:A? = nil
}
var b = B()

if b.a?.id == nil {
    print("b.a?.id == nil //true")
} else {
    print("b.a?.id == nil //false")
}
