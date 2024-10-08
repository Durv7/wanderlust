

const Listing = require("../models/listing.js");
module.exports.index=async (req, res) => {
    let allListings = await Listing.find({});
    res.render("listings/index.ejs", { allListings });
}

module.exports.renderNewForm= (req, res) => {

    res.render("listings/new.ejs");
}

module.exports.showListing=async (req, res) => {
    let { id } = req.params;
    let listing = await Listing.findById(id)
    .populate({path:"reviews",
        populate:
        {path:"author"}
    })
    .populate("owner");
    if (!listing) {
        req.flash("error", "Listing You Requested Doesn't Exists ! ");
        res.redirect("/listings");
    }
    res.render("listings/show.ejs", { listing });
}

module.exports.createListing=async (req, res, next) => {
    // console.log(req.file);

    let url =req.file.path;
    let filename=req.file.filename;
    let newlisting = new Listing(req.body.listing);
    newlisting.owner=req.user._id;
    newlisting.image={url,filename};

 
    let result= await newlisting.save();
    console.log(result);

    req.flash("success", "New Listing Added !");
    res.redirect("/listings");
}

module.exports.renderEditForm=async (req, res) => {
    let { id } = req.params;
    let listing = await Listing.findById(id);
    if (!listing) {
        req.flash("error", "Listing You Requested Doesn't Exists ! ");
        res.redirect("/listings");
    }
    let originalUrl=listing.image.url;
    originalUrl=originalUrl.replace("/upload","/upload/h_200,w_200")
    res.render("listings/edit.ejs", { listing  ,originalUrl});
}

module.exports.updateListing=async (req, res, next) => {
    let { id } = req.params;
    let listing = await Listing.findByIdAndUpdate(id, { ...req.body.listing });
    if(req.file)
    {
        let url =req.file.path;
        let filename=req.file.filename;
        listing.image={url,filename};
        listing.save();
    }

    req.flash("success", "Listing Updated ! ");
    res.redirect(`/listings/${id}`);
}

module.exports.destroyListing= async (req, res) => {
    let { id } = req.params;
    await Listing.findByIdAndDelete(id);
    req.flash("success", "Listing Deleted ! ");
    res.redirect("/listings");
}

module.exports.filteredListing=async(req,res)=>{
    let filter=req.query.q;
    let allListings=await Listing.find({category:{$in:filter}});
    res.render("listings/index.ejs",{allListings});
}

module.exports.searchListing=async(req,res)=>{
    let countrySearch =req.query.q;
    allListings=await Listing.find({country:countrySearch});
    res.render("listings/index.ejs", {allListings});
}