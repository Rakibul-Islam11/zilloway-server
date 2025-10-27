const errorResponse = (res, { statusCode = 500, message = "Internal Server Error" } = {}) => {
    return res.status(statusCode).json({
        success: false,
        message: message,
    });
};

const successResponse = (res, { statusCode = 200, message = "success", payload={} } = {}) => {
    return res.status(statusCode).json({
        success: true,
        message: message,
        payload
    });
};

module.exports = { errorResponse, successResponse };














// 📝 বিশ্লেষণ
// 1. ফাংশন ডিফিনিশন
// const errorResponse = (res, { statusCode = 500, message = "Internal Server Error" } = {}) => { ... }


// errorResponse হলো একটি Arrow Function।

// এটি দুইটা parameter নেয়:

// res → Express এর response object।

// { statusCode = 500, message = "Internal Server Error" } = { } → এটি একটি destructured object parameter।

// 2. Destructured Object Parameter
// { statusCode = 500, message = "Internal Server Error" } = { }


// এখানে দ্বিতীয় parameter টা object আকারে নিতে হচ্ছে।

// Object এর মধ্যে দুইটা key নেওয়া হচ্ছে:

// statusCode → default মান 500।

// message → default মান "Internal Server Error"।

// = { } মানে হলো fallback → যদি দ্বিতীয় argument একদমই না দেওয়া হয় তাহলে empty object ধরে নেওয়া হবে।

// 3. Default Value Logic

// যদি function কে ডাকা হয়:

// errorResponse(res);


// তখন দ্বিতীয় argument নাই → fallback হিসেবে { } বসবে।
// statusCode → 500,
//     message → "Internal Server Error"।

// যদি function কে ডাকা হয়:

// errorResponse(res, { statusCode: 404, message: "Not Found" });


// তাহলে আপনার দেওয়া মান বসবে।
// statusCode → 404,
//     message → "Not Found"।

// 4. Function Body
// return res.status(statusCode).json({
//     success: false,
//     message: message,
// });


// এখানে Express এর res object ব্যবহার করে response পাঠানো হচ্ছে।

// .status(statusCode) → HTTP status code সেট করছে(যেমন 404, 500, ইত্যাদি)।

// .json({ ... }) → JSON response পাঠাচ্ছে।

// ফাইনাল রেসপন্স সবসময় এরকম হবে:

// {
//     "success": false,
//         "message": "Internal Server Error"
// }


// (অবশ্যই আপনার দেওয়া message অনুযায়ী পরিবর্তিত হবে।)

// 5. Export
// module.exports = errorResponse;


// এখানে errorResponse function টাকে export করা হচ্ছে।

// যাতে অন্য ফাইল থেকে require("./errorResponse") দিয়ে এটা ব্যবহার করা যায়।

// ✅ সারাংশ(নোট করার মতো)

// errorResponse একটি arrow function, express এর error response তৈরি করার জন্য।

// Parameter 1 → res(Express এর response object)।

// Parameter 2 → destructured object → statusCode(default 500), message(default "Internal Server Error")।

// = {  } fallback রাখা হয়েছে যেন দ্বিতীয় argument না দিলেও error না হয়।

// Function সবসময় JSON return করবে → { success: false, message: "..." }।

// module.exports এর মাধ্যমে অন্য ফাইলে ব্যবহারযোগ্য করা হয়েছে।

// 👉 এইটা basically একটা reusable error handler function