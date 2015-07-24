
var settingObj = {
        'flipkart': {
            site: "flipkart",
            selectors: {
                parentDiv: 'products',
                item: ".gd-col",
                image: "img",
                link: "a",
                rating: ".pu-rating",
                name: ".pu-title",
                title: ".lu-title-wrapper a",
                price: ".pu-final",
                destinationDiv: "#flipkart-div"
            },
            url: "http://www.flipkart.com/search?q=<replace>"
        },
        'snapdeal': {
            site: "snapdeal",
            selectors: {
                parentDiv: 'products-main4',
                item: '.product_grid_cont',
                image: "img",
                link: "a",
                rating: ".ratingsWrapper",
                name: ".product-title",
                price: ".product-price div",
                destinationDiv: "#snapdeal-div"
            },
            url: "http://www.snapdeal.com/search?keyword=n<replace>&santizedKeyword=<replace>&catId=&categoryId=&suggested=false&vertical=&noOfResults=20&clickSrc=go_header&lastKeyword=<replace>&prodCatId=&changeBackToAll=false&foundInAll=false&categoryIdSearched=&cityPageUrl"
        },
        'amazon': {
            site: "amazon",
            selectors: {
                parentDiv: 's-results-list-atf',
                item: ".s-result-item",
                image: "img",
                link: "a",
                rating: ".a-popover-trigger",
                name: "h2",
                price: ".a-color-price.s-price",
                destinationDiv: "#amazon-div"
            },
            url: "http://www.amazon.in/s/ref=nb_sb_ss_i_1_5?field-keywords=<replace>"
        }
    },
    sites = ['amazon', 'flipkart', 'snapdeal'];
        
var ProductInfoCollector = function  (settingObj) {
    this.selectors = settingObj.selectors;
    this.url = settingObj.url;
    this.name = settingObj.site;
}


ProductInfoCollector.prototype.sendRequest = function (product) {
    var req = new XMLHttpRequest();
    var url = this.url,
        self = this;
    url = url.replace("<replace>", product);
    req.open("GET", url, true);
    if (req.readyState === 4) {
        if (req.status === 200) {  
        } else {  
           console.log("Error", req.statusText);
           $(this.selectors.destinationDiv).html("<div class='error-div product-div'> Oops! There is some error :(</div>");
        }  
    } 
    req.onload = this.setHtml.bind(this);

    req.send(null);
};

ProductInfoCollector.prototype.setHtml = function (e) {
    var htm = e.target.responseText,
        parser = new DOMParser(),
        selectors = this.selectors,
        rating, stars, pos, rs, name,
        doc = parser.parseFromString(htm, "text/html"),
        products = doc.getElementById(selectors.parentDiv),
        $products, str = '',
        $destDiv = $(selectors.destinationDiv),
        $product, src, roundedOffStar,
        $productName, $productLink, $productPrice, $productRating;
    $destDiv.html(products).css("display", "none");
    $product = $destDiv.find(selectors.item)
    $productsImg = $product.find(selectors.image);
    $productLink = $product.find(selectors.link);
    $productName = $product.find(selectors.name);
    $productPrice = $product.find(selectors.price);
    $productRating = $product.find(selectors.rating);
    for (var i = 0; i < 2; i++) {
        name = $productName.eq(i).text() ? $productName.eq(i).text() : $product.find(selectors.title).eq(i).text();
        if (name) {
            src = $productsImg.eq(i).data('src') ? $productsImg.eq(i).data('src') : ($productsImg.eq(i).attr('src') ? $productsImg.eq(i).attr('src') : $productsImg.eq(i).attr('lazysrc'));
            src = !src ? $productsImg.eq(i).attr('hoversrc') : src;
            rating = $productRating.eq(i).html() ? $productRating.eq(i).html() : "";
            rs = this.name === "amazon" ? 'Rs' : ''  ;
            str += '<div class="product-div"><div style="float:left" ><a href="'+$productLink.eq(i).attr('href')+'"><img src="'+src+'" /></a></div>';
            str += '<div style="float:left; margin-left:20px;width:150px"><a href="'+$productLink.eq(i).attr('href')+'"><div >'+ name +'</div>';
            str += '<div class="rating">'+rating+'</div>';
            str += '<div class="price-div">'+ rs +' '+$productPrice.eq(i).html()+'</div></div>';
            str += '<div style="clear:both"></div></div>';
        } else {
            str += "<div class='error-div product-div'> Oops! There is some error :(</div>";
        }
        
    }
    $destDiv.html(str).css("display", "block");
    //  ratings snapdeal products
    $(".ratingStarsSmall").each(function(){
        stars = $(this).attr('ratings');
        roundedOffStar = Math.round(stars);
        if(stars) {
            pos = '0px -'+ ( roundedOffStar < stars ? ((roundedOffStar*20) + 10) : (roundedOffStar*20))+ 'px';
            $(this).css('background-position', pos)
                    .attr('title', stars + ' stars');
        }
    });
}

function getProductInfo () {
    var str = $("#search-box").val().trim().split("+");
    $("#info-div").css("display", "block");
    $(".site-content").html("<img src='./images/loading.gif' />");
    sites.forEach(function(val){
        (new ProductInfoCollector(settingObj[val])).sendRequest(str);
    });

}
$(document).ready(function(){
    $('#submit-btn').click(getProductInfo);
    $("#search-box").keydown(function(e){
        if (e.which === 13) {
            e.preventDefault();
            $('#submit-btn').click();
        }
    });
});

