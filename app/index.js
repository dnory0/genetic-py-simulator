"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var child_process_1 = require("child_process");
var path_1 = require("path");
var genPy = child_process_1.spawn("electron", ["."], {
    cwd: path_1.join(__dirname, ".."),
    detached: true,
    stdio: "ignore"
});
genPy.unref();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJpbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUVBLCtDQUFzQztBQUN0Qyw2QkFBNEI7QUFFNUIsSUFBTSxLQUFLLEdBQUcscUJBQUssQ0FBQyxVQUFVLEVBQUUsQ0FBQyxHQUFHLENBQUMsRUFBRTtJQUNyQyxHQUFHLEVBQUUsV0FBSSxDQUFDLFNBQVMsRUFBRSxJQUFJLENBQUM7SUFDMUIsUUFBUSxFQUFFLElBQUk7SUFFZCxLQUFLLEVBQUUsUUFBUTtDQUNoQixDQUFDLENBQUM7QUFFSCxLQUFLLENBQUMsS0FBSyxFQUFFLENBQUMifQ==