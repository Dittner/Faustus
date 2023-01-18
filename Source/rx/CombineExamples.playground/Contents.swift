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

var str = "даже по- зволить себе, I ca- n't let you"
let res = str.replacingOccurrences(of: "([А-я])- ", with: "$1", options: .regularExpression)


    

let subject = PassthroughSubject<String, Never>()
var disposeBag: Set<AnyCancellable> = []
    subject
    //.debounce(for: 0.2, scheduler: RunLoop.main)
    .sink { event in
        print(event)
    }
    .store(in: &disposeBag)

//subject.send("Request 1")
//subject.send("Request 2")



func networkCall(parameter: Int, onProgress: (Any) -> Void, onSuccess: (Any) -> Void) {
    // network call
    onSuccess("someNetworkResult")
}

// it can be used for Swift 5.3
//networkCall(parameter: 1) { progress in
//    print(progress)
//} onSuccess: { result in
//    print(result)
//}

//for i in 2 ... 181 {
//    if i < 10 {
//        print("curl https://ia800109.us.archive.org/9/items/zem69061_zamge_071/00\(i).mp3 --output 00\(i).mp3")
//    } else if i < 100 {
//        print("curl https://ia800109.us.archive.org/9/items/zem69061_zamge_071/0\(i).mp3 --output 0\(i).mp3")
//    } else {
//        print("curl https://ia800109.us.archive.org/9/items/zem69061_zamge_071/\(i).mp3 --output \(i).mp3")
//    }
//}

//#if swift(>=5.4)
//    print("Current Swift Version: 5.4")
//
//#elseif swift(>=5.3)
//    print("Current Swift Version: 5.3")
//
//#elseif swift(>=5.2)
//    print("Current Swift Version: 5.2")
//
//#elseif swift(>=5.1)
//    print("Current Swift Version: 5.1")
//
//#elseif swift(>=5.0)
//    print("Current Swift Version: 5.0")
//
//#elseif swift(>=4.2)
//    print("Current Swift Version: 4.2")
//
//#elseif swift(>=4.1)
//    print("Current Swift Version: 4.1")
//
//#elseif swift(>=4.0)
//    print("Current Swift Version: 4.0")
//
//#endif
//
//let str = " John   Fitzgerald Kennedi "
//let initials = str.components(separatedBy: " ")
//    .filter { $0 != "" }
//    .map { value in
//        String(value.first!) + "."
//    }
//    .reduce("") { $0 + $1 }
//
//print("substrings = \(initials)")
//
//func printTest1(_ result: @autoclosure () -> Void) {
//    print("Before")
//    result()
//    print("After")
//}
//
//printTest1(print("Hello"))

//class Org {
//    var name:String
//    var persons:[Person] = []
//    init(name:String) {
//        self.name = name
//    }
//
//    deinit {
//        print("deinit of Org, <\(name)>")
//    }
//}
//
//class Person {
//    var name:String
//    weak var org:Org?
//
//    init(name:String) {
//        self.name = name
//    }
//
//    deinit {
//        print("deinit of Person, <\(name)>")
//    }
//}
//
//var org = Org(name: "Lanit")
//var p = Person(name: "Otto")
//p.org = org
//org.persons = [p]
//
//org = Org(name: "Yandex")
//
//var p2 = Person(name: "Adolf")
//p2.org = org
//org.persons = [p2]
//
//p = p2


//
//class Item {
//    var itemId: Int
//    var name: String
//    var price: Float
//
//    init(id: Int, name: String, price: Float) {
//        self.itemId = id
//        self.name = name
//        self.price = price
//    }
//}
//
//class Order {
//
//    var items: [Item] = []
//    var deleteBlock: (()->(Void))?
//    var timer: Timer?
//
//    /// сумма заказа
//    var total: Float {
//        var total = Float(exactly: 0)!
//        var i = 0
//        while i < items.count {
//            let item = items[i]
//            total += item.price
//            i += 1
//        }
//        return total
//    }
//
//    ///  Добавить товар к заказу
//    func put(item: Item) {
//        items.append(item)
//    }
//
//    /// Посчитать заказ и подготовить к отправке
//    func make() -> [[String: Int]] {
//        var data: [[String: Int]] = []
//        for item in items {
//            let newRow: [String: Int] = ["id": item.itemId, "count": 1]
//            var needNewRow = true
//            for var row in data {
//                if item.itemId == row["id"]! {
//                    row["count"] = row["count"]! + 1
//                    needNewRow = false
//                }
//            }
//            if needNewRow {
//                data.append(newRow)
//            }
//        }
//        return data
//    }
//
//    /// удалить товары из заказа через 20 секунд
//    func deleteAfter20Seconds(block: (()->(Void))?) {
//        self.deleteBlock = block
//        self.timer = Timer.scheduledTimer(withTimeInterval: 5, repeats: false, block: { (timer) in
//            self.delete()
//        })
//    }
//
//    /// отменить удаление товаров
//    func cancelDelete() {
//        self.timer = nil
//        print("delete canceled")
//    }
//
//    ///очистка товаров
//    func delete() {
//        items = []
//        deleteBlock?()
//        print("delete complete")
//    }
//}
//
//let item1 = Item(id: 0, name: "First", price: 1.25)
//let item2 = Item(id: 0, name: "First2", price: 1.25)
//let item3 = Item(id: 1, name: "Second", price: 1)
//let item4 = Item(id: 2, name: "Third", price: 10)
//let order = Order()
//order.put(item: item1)
//order.put(item: item2)
//order.put(item: item3)
//order.put(item: item4)
//
//let total = order.total
//print("total <\(total)>")
//
//let items = order.make()
//print("items.count <\(items.count)>")
//order.deleteAfter20Seconds(block: nil)
//order.cancelDelete()


func b() -> some Equatable { 420 }

//func b(isNumber: Bool) -> some Equatable { isNumber ? 420 : "foobar" }
//Result values in '? :' expression have mismatching types 'Int' and 'String'



let aa = CurrentValueSubject<Int, Never>(0)
let bb = CurrentValueSubject<Int, Never>(0)
let publishers = [aa, bb]
_ = publishers.publisher
    .flatMap { $0 }
    .sink { debugPrint($0) }
aa.send(420)
bb.send(228)

var foo = [420]
var bar = foo
foo[0] = 228
debugPrint(bar[0])

DispatchQueue.main.async {
    debugPrint("A")
    DispatchQueue.main.sync {
        debugPrint("B")
    }
    debugPrint("C")
}
debugPrint("D")


var age = 20
 
let closure = {
  debugPrint(age)
}
age = 40
 
closure()

