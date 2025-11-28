package klu.model;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import klu.repo.BidRepository;
import klu.repo.WalletRepository;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class BidManager {

    @Autowired
    private BidRepository bidRepo;

    @Autowired
    private WalletRepository walletRepo;

    @Autowired
    private NotificationManager notificationManager;

    @Autowired
    private ProductManager productManager;

    public String placeBid(Bid bid) {
        double balance = walletRepo.getBalanceByEmail(bid.getBuyerEmail());

        if (balance < bid.getBidAmount()) {
            return "403::Insufficient Wallet Balance";
        }

        // Get current highest bid before placing new bid
        Bid previousHighestBid = getHighestBid(bid.getProductId());
        String previousHighestBidder = previousHighestBid != null ? previousHighestBid.getBuyerEmail() : null;

        bid.setBidTime(LocalDateTime.now());
        bidRepo.save(bid);

        // Get new highest bid after placing
        Bid newHighestBid = getHighestBid(bid.getProductId());
        
        // Get product name for notification
        Product product = productManager.getProductById(bid.getProductId());
        String productName = product != null ? product.getName() : "Product #" + bid.getProductId();

        // Notify previous highest bidder if they were outbid
        if (previousHighestBid != null && 
            previousHighestBidder != null && 
            !previousHighestBidder.equals(bid.getBuyerEmail()) &&
            newHighestBid != null && 
            newHighestBid.getId() == bid.getId()) {
            
            // Previous bidder was outbid
            notificationManager.createNotification(
                previousHighestBidder,
                "You've been outbid on '" + productName + "'. Current highest bid: $" + String.format("%.2f", bid.getBidAmount()),
                "OUTBID",
                bid.getProductId()
            );
        }

        // Notify new bidder if they now have the winning bid
        if (newHighestBid != null && newHighestBid.getId() == bid.getId()) {
            notificationManager.createNotification(
                bid.getBuyerEmail(),
                "Congratulations! You have the winning bid on '" + productName + "' with $" + String.format("%.2f", bid.getBidAmount()),
                "WINNING_BID",
                bid.getProductId()
            );
        }

        return "200::Bid Placed Successfully";
    }

    public List<Bid> getBidsForProduct(int productId) {
        return bidRepo.findByProductId(productId);
    }

    public Bid getHighestBid(int productId) {
        List<Bid> bids = bidRepo.findHighestBidByProductId(productId);
        if (bids.isEmpty()) return null;
        return bids.get(0);
    }
}
