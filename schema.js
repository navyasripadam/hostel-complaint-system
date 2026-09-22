const Joi=require("joi");

const complaintSchema=Joi.object({
    title:Joi.string().required(),
    description:Joi.string().required(),
    category:Joi.string().valid(
        "electrical",
        "plumbing",
        "civil",
        "wifi",
        "others"
    ).required()
});


module.exports=complaintSchema;