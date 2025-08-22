/**
 * 🚀 TRANSPARENT PRICING SYSTEM
 * Revolutionary pricing transparency that crushes Expedia's hidden fee model
 * 100% upfront pricing vs competitors' checkout surprises
 */

'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface PriceBreakdown {
  basePrice: number;
  taxes: number;
  fees: {
    airlineFees: number;
    facilityCharges: number;
    securityFees: number;
    bookingFee: number;
  };
  total: number;
  currency: string;
  savings: {
    vsKayak: number;
    vsExpedia: number;
    vsPriceline: number;
  };
  hiddenFeesComparison: {
    fly2any: number;
    competitors: number;
  };
}

interface TransparentPricingProps {
  priceData: PriceBreakdown;
  passengers: number;
  className?: string;
  showComparison?: boolean;
}

export default function TransparentPricing({ 
  priceData, 
  passengers = 1, 
  className = '', 
  showComparison = true 
}: TransparentPricingProps) {
  const [showFullBreakdown, setShowFullBreakdown] = useState(false);
  const [animateValue, setAnimateValue] = useState(false);

  useEffect(() => {
    setAnimateValue(true);
  }, [priceData]);

  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: priceData.currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const getCompetitorTotal = (competitor: 'kayak' | 'expedia' | 'priceline') => {
    const baseSavings = priceData.savings[`vs${competitor.charAt(0).toUpperCase() + competitor.slice(1)}` as keyof typeof priceData.savings];
    return priceData.total + baseSavings;
  };

  const AnimatedPrice = ({ value, prefix = '', suffix = '' }: { value: number; prefix?: string; suffix?: string }) => (
    <motion.span
      key={value}
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.3, type: 'spring' }}
      className="animated-price"
    >
      {prefix}{formatPrice(value)}{suffix}
    </motion.span>
  );

  return (
    <div className={`transparent-pricing ${className}`}>
      {/* Trust Badge */}
      <div className="pricing-header">
        <div className="transparency-badge">
          <span className="badge-icon">💎</span>
          <div className="badge-content">
            <span className="badge-title">100% Transparent Pricing</span>
            <span className="badge-subtitle">No hidden fees • What you see is what you pay</span>
          </div>
        </div>
      </div>

      {/* Main Price Display */}
      <div className="main-price-section">
        <div className="price-container">
          <div className="total-price">
            <AnimatedPrice value={priceData.total * passengers} />
            {passengers > 1 && (
              <span className="per-person">
                ({formatPrice(priceData.total)} per person)
              </span>
            )}
          </div>
          <div className="price-label">Total Price • All Fees Included</div>
        </div>

        <button 
          className="breakdown-toggle"
          onClick={() => setShowFullBreakdown(!showFullBreakdown)}
        >
          <span>See Price Breakdown</span>
          <span className={`arrow ${showFullBreakdown ? 'up' : 'down'}`}>
            {showFullBreakdown ? '▲' : '▼'}
          </span>
        </button>
      </div>

      {/* Detailed Breakdown */}
      <AnimatePresence>
        {showFullBreakdown && (
          <motion.div
            className="price-breakdown"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="breakdown-header">
              <h4>Complete Price Breakdown</h4>
              <div className="transparency-note">
                <span className="note-icon">🔍</span>
                <span>Every cent explained - no surprises at checkout</span>
              </div>
            </div>

            <div className="breakdown-items">
              <div className="breakdown-item main">
                <span className="item-label">Base Airfare</span>
                <span className="item-value">
                  <AnimatedPrice value={priceData.basePrice * passengers} />
                </span>
              </div>

              <div className="breakdown-item">
                <span className="item-label">
                  Taxes & Government Fees
                  <span className="item-note">Required by law</span>
                </span>
                <span className="item-value">
                  <AnimatedPrice value={priceData.taxes * passengers} />
                </span>
              </div>

              <div className="breakdown-item">
                <span className="item-label">
                  Airline Service Fees
                  <span className="item-note">Set by airline</span>
                </span>
                <span className="item-value">
                  <AnimatedPrice value={priceData.fees.airlineFees * passengers} />
                </span>
              </div>

              <div className="breakdown-item">
                <span className="item-label">
                  Airport Facility Charges
                  <span className="item-note">Airport maintenance</span>
                </span>
                <span className="item-value">
                  <AnimatedPrice value={priceData.fees.facilityCharges * passengers} />
                </span>
              </div>

              <div className="breakdown-item">
                <span className="item-label">
                  Security Fees
                  <span className="item-note">TSA security</span>
                </span>
                <span className="item-value">
                  <AnimatedPrice value={priceData.fees.securityFees * passengers} />
                </span>
              </div>

              <div className="breakdown-item zero-fee">
                <span className="item-label">
                  Fly2Any Booking Fee
                  <span className="item-note">Our service fee</span>
                </span>
                <span className="item-value zero">
                  <span className="crossed-out">{formatPrice(25)}</span>
                  <span className="free-badge">FREE</span>
                </span>
              </div>

              <div className="breakdown-divider"></div>

              <div className="breakdown-item total">
                <span className="item-label">Total Amount</span>
                <span className="item-value">
                  <AnimatedPrice value={priceData.total * passengers} />
                </span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Competitor Comparison */}
      {showComparison && (
        <div className="competitor-comparison">
          <div className="comparison-header">
            <h4>
              <span className="comparison-icon">⚔️</span>
              How We Compare to Competitors
            </h4>
            <div className="comparison-subtitle">
              See what others would charge you for the same flight
            </div>
          </div>

          <div className="comparison-grid">
            {/* Fly2Any */}
            <div className="comparison-item winner">
              <div className="competitor-header">
                <div className="competitor-logo">
                  <span className="logo-icon">✈️</span>
                  <span className="logo-text">Fly2Any</span>
                </div>
                <div className="winner-badge">BEST PRICE</div>
              </div>
              
              <div className="competitor-pricing">
                <div className="advertised-price">
                  <span className="price-label">Total Price</span>
                  <span className="price-value">
                    <AnimatedPrice value={priceData.total * passengers} />
                  </span>
                </div>
                
                <div className="hidden-fees">
                  <span className="fees-label">Hidden Fees</span>
                  <span className="fees-value zero">$0</span>
                </div>
                
                <div className="final-price">
                  <span className="final-label">You Pay</span>
                  <span className="final-value">
                    <AnimatedPrice value={priceData.total * passengers} />
                  </span>
                </div>
              </div>

              <div className="transparency-score">
                <div className="score-label">Transparency Score</div>
                <div className="score-bar">
                  <div className="score-fill" style={{ width: '100%' }}></div>
                </div>
                <div className="score-text">100% Transparent</div>
              </div>
            </div>

            {/* Kayak */}
            <div className="comparison-item">
              <div className="competitor-header">
                <div className="competitor-logo">
                  <span className="logo-icon">🏝️</span>
                  <span className="logo-text">Kayak</span>
                </div>
              </div>
              
              <div className="competitor-pricing">
                <div className="advertised-price">
                  <span className="price-label">Advertised Price</span>
                  <span className="price-value">
                    {formatPrice((priceData.total - 45) * passengers)}
                  </span>
                </div>
                
                <div className="hidden-fees">
                  <span className="fees-label">+ Hidden Fees</span>
                  <span className="fees-value">+{formatPrice(45 * passengers)}</span>
                </div>
                
                <div className="final-price">
                  <span className="final-label">You Actually Pay</span>
                  <span className="final-value expensive">
                    {formatPrice(getCompetitorTotal('kayak') * passengers)}
                  </span>
                </div>
              </div>

              <div className="transparency-score">
                <div className="score-label">Transparency Score</div>
                <div className="score-bar">
                  <div className="score-fill warning" style={{ width: '60%' }}></div>
                </div>
                <div className="score-text">60% Hidden Fees</div>
              </div>
            </div>

            {/* Expedia */}
            <div className="comparison-item">
              <div className="competitor-header">
                <div className="competitor-logo">
                  <span className="logo-icon">🧳</span>
                  <span className="logo-text">Expedia</span>
                </div>
              </div>
              
              <div className="competitor-pricing">
                <div className="advertised-price">
                  <span className="price-label">Advertised Price</span>
                  <span className="price-value">
                    {formatPrice((priceData.total - 67) * passengers)}
                  </span>
                </div>
                
                <div className="hidden-fees">
                  <span className="fees-label">+ Hidden Fees</span>
                  <span className="fees-value">+{formatPrice(67 * passengers)}</span>
                </div>
                
                <div className="final-price">
                  <span className="final-label">You Actually Pay</span>
                  <span className="final-value expensive">
                    {formatPrice(getCompetitorTotal('expedia') * passengers)}
                  </span>
                </div>
              </div>

              <div className="transparency-score">
                <div className="score-label">Transparency Score</div>
                <div className="score-bar">
                  <div className="score-fill danger" style={{ width: '45%' }}></div>
                </div>
                <div className="score-text">45% Hidden Fees</div>
              </div>
            </div>

            {/* Priceline */}
            <div className="comparison-item">
              <div className="competitor-header">
                <div className="competitor-logo">
                  <span className="logo-icon">💳</span>
                  <span className="logo-text">Priceline</span>
                </div>
              </div>
              
              <div className="competitor-pricing">
                <div className="advertised-price">
                  <span className="price-label">Advertised Price</span>
                  <span className="price-value">
                    {formatPrice((priceData.total - 34) * passengers)}
                  </span>
                </div>
                
                <div className="hidden-fees">
                  <span className="fees-label">+ Hidden Fees</span>
                  <span className="fees-value">+{formatPrice(34 * passengers)}</span>
                </div>
                
                <div className="final-price">
                  <span className="final-label">You Actually Pay</span>
                  <span className="final-value expensive">
                    {formatPrice(getCompetitorTotal('priceline') * passengers)}
                  </span>
                </div>
              </div>

              <div className="transparency-score">
                <div className="score-label">Transparency Score</div>
                <div className="score-bar">
                  <div className="score-fill warning" style={{ width: '70%' }}></div>
                </div>
                <div className="score-text">70% Hidden Fees</div>
              </div>
            </div>
          </div>

          {/* Savings Summary */}
          <div className="savings-summary">
            <div className="savings-header">
              <span className="savings-icon">💰</span>
              <span className="savings-title">Your Savings with Fly2Any</span>
            </div>
            <div className="savings-grid">
              <div className="savings-item">
                <span className="vs-label">vs Kayak</span>
                <span className="savings-amount">Save {formatPrice(priceData.savings.vsKayak * passengers)}</span>
              </div>
              <div className="savings-item">
                <span className="vs-label">vs Expedia</span>
                <span className="savings-amount">Save {formatPrice(priceData.savings.vsExpedia * passengers)}</span>
              </div>
              <div className="savings-item">
                <span className="vs-label">vs Priceline</span>
                <span className="savings-amount">Save {formatPrice(priceData.savings.vsPriceline * passengers)}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Trust Guarantees */}
      <div className="trust-guarantees">
        <h4>Our Pricing Guarantees</h4>
        <div className="guarantees-grid">
          <div className="guarantee-item">
            <span className="guarantee-icon">🔒</span>
            <div className="guarantee-content">
              <span className="guarantee-title">No Hidden Fees</span>
              <span className="guarantee-text">Price shown is price paid - guaranteed</span>
            </div>
          </div>
          
          <div className="guarantee-item">
            <span className="guarantee-icon">💰</span>
            <div className="guarantee-content">
              <span className="guarantee-title">Price Match Promise</span>
              <span className="guarantee-text">Find lower? We'll match + give you $25</span>
            </div>
          </div>
          
          <div className="guarantee-item">
            <span className="guarantee-icon">📞</span>
            <div className="guarantee-content">
              <span className="guarantee-title">24/7 Support</span>
              <span className="guarantee-text">Free price protection and assistance</span>
            </div>
          </div>
        </div>
      </div>

      {/* Inline Styles */}
      <style jsx>{`
        .transparent-pricing {
          background: white;
          border-radius: 16px;
          padding: 24px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
          border: 1px solid #e2e8f0;
          margin-bottom: 24px;
        }

        .pricing-header {
          margin-bottom: 24px;
        }

        .transparency-badge {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 16px;
          background: linear-gradient(135deg, #ecfdf5, #d1fae5);
          border: 1px solid #10b981;
          border-radius: 12px;
        }

        .badge-icon {
          font-size: 24px;
        }

        .badge-content {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .badge-title {
          font-size: 16px;
          font-weight: 700;
          color: #059669;
        }

        .badge-subtitle {
          font-size: 13px;
          color: #047857;
        }

        .main-price-section {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 24px;
        }

        .price-container {
          flex: 1;
        }

        .total-price {
          font-size: 36px;
          font-weight: 800;
          color: #1e293b;
          line-height: 1;
          margin-bottom: 4px;
        }

        .per-person {
          font-size: 14px;
          color: #64748b;
          font-weight: 500;
          margin-left: 8px;
        }

        .price-label {
          font-size: 14px;
          color: #10b981;
          font-weight: 600;
        }

        .breakdown-toggle {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 16px;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.3s ease;
          font-size: 14px;
          color: #475569;
        }

        .breakdown-toggle:hover {
          background: #e2e8f0;
          color: #1e293b;
        }

        .arrow {
          font-size: 12px;
          transition: transform 0.3s ease;
        }

        .arrow.up {
          transform: rotate(180deg);
        }

        .price-breakdown {
          border-top: 1px solid #e2e8f0;
          padding-top: 24px;
          overflow: hidden;
        }

        .breakdown-header {
          margin-bottom: 20px;
        }

        .breakdown-header h4 {
          font-size: 18px;
          font-weight: 700;
          color: #1e293b;
          margin: 0 0 8px 0;
        }

        .transparency-note {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 13px;
          color: #64748b;
        }

        .note-icon {
          font-size: 14px;
        }

        .breakdown-items {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .breakdown-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 12px 0;
        }

        .breakdown-item.main {
          background: #f8fafc;
          padding: 16px;
          border-radius: 8px;
          border: 1px solid #e2e8f0;
        }

        .breakdown-item.total {
          border-top: 2px solid #e2e8f0;
          padding-top: 16px;
          margin-top: 8px;
          font-weight: 700;
        }

        .breakdown-item.zero-fee {
          background: linear-gradient(135deg, #fef3c7, #fde68a);
          padding: 12px 16px;
          border-radius: 8px;
          border: 1px solid #f59e0b;
        }

        .item-label {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .item-note {
          font-size: 11px;
          color: #94a3b8;
          font-style: italic;
        }

        .item-value {
          font-weight: 700;
          color: #1e293b;
        }

        .item-value.zero {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .crossed-out {
          text-decoration: line-through;
          color: #94a3b8;
          font-weight: 400;
        }

        .free-badge {
          padding: 2px 8px;
          background: #10b981;
          color: white;
          border-radius: 12px;
          font-size: 10px;
          font-weight: 700;
        }

        .breakdown-divider {
          height: 1px;
          background: #e2e8f0;
          margin: 8px 0;
        }

        .competitor-comparison {
          border-top: 2px solid #e2e8f0;
          padding-top: 32px;
          margin-top: 32px;
        }

        .comparison-header {
          text-align: center;
          margin-bottom: 24px;
        }

        .comparison-header h4 {
          font-size: 20px;
          font-weight: 700;
          color: #1e293b;
          margin: 0 0 8px 0;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }

        .comparison-icon {
          font-size: 20px;
        }

        .comparison-subtitle {
          font-size: 14px;
          color: #64748b;
        }

        .comparison-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 16px;
          margin-bottom: 24px;
        }

        .comparison-item {
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          padding: 16px;
          transition: all 0.3s ease;
        }

        .comparison-item.winner {
          background: linear-gradient(135deg, #ecfdf5, #d1fae5);
          border-color: #10b981;
          box-shadow: 0 4px 12px rgba(16, 185, 129, 0.15);
        }

        .competitor-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 16px;
        }

        .competitor-logo {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .logo-icon {
          font-size: 20px;
        }

        .logo-text {
          font-size: 16px;
          font-weight: 700;
          color: #1e293b;
        }

        .winner-badge {
          padding: 4px 8px;
          background: #10b981;
          color: white;
          border-radius: 12px;
          font-size: 10px;
          font-weight: 700;
        }

        .competitor-pricing {
          margin-bottom: 16px;
        }

        .advertised-price,
        .hidden-fees,
        .final-price {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 8px 0;
        }

        .final-price {
          border-top: 1px solid #e2e8f0;
          padding-top: 12px;
          margin-top: 8px;
          font-weight: 700;
        }

        .price-label,
        .fees-label,
        .final-label {
          font-size: 12px;
          color: #64748b;
        }

        .price-value,
        .final-value {
          font-weight: 700;
          color: #1e293b;
        }

        .fees-value {
          font-weight: 600;
          color: #dc2626;
        }

        .final-value.expensive {
          color: #dc2626;
        }

        .transparency-score {
          text-align: center;
        }

        .score-label {
          font-size: 11px;
          color: #64748b;
          margin-bottom: 4px;
        }

        .score-bar {
          width: 100%;
          height: 6px;
          background: #e2e8f0;
          border-radius: 3px;
          overflow: hidden;
          margin-bottom: 4px;
        }

        .score-fill {
          height: 100%;
          background: #10b981;
          transition: width 0.5s ease;
        }

        .score-fill.warning {
          background: #f59e0b;
        }

        .score-fill.danger {
          background: #dc2626;
        }

        .score-text {
          font-size: 10px;
          color: #64748b;
          font-weight: 600;
        }

        .savings-summary {
          background: linear-gradient(135deg, #fef3c7, #fde68a);
          border: 1px solid #f59e0b;
          border-radius: 12px;
          padding: 20px;
          margin-bottom: 24px;
        }

        .savings-header {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 16px;
        }

        .savings-icon {
          font-size: 20px;
        }

        .savings-title {
          font-size: 16px;
          font-weight: 700;
          color: #92400e;
        }

        .savings-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
          gap: 12px;
        }

        .savings-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 4px;
        }

        .vs-label {
          font-size: 12px;
          color: #a16207;
          font-weight: 500;
        }

        .savings-amount {
          font-size: 16px;
          font-weight: 700;
          color: #059669;
        }

        .trust-guarantees {
          border-top: 1px solid #e2e8f0;
          padding-top: 24px;
        }

        .trust-guarantees h4 {
          font-size: 18px;
          font-weight: 700;
          color: #1e293b;
          margin: 0 0 16px 0;
          text-align: center;
        }

        .guarantees-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 16px;
        }

        .guarantee-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 16px;
          background: #f8fafc;
          border-radius: 8px;
          border: 1px solid #e2e8f0;
        }

        .guarantee-icon {
          font-size: 24px;
        }

        .guarantee-content {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .guarantee-title {
          font-size: 14px;
          font-weight: 700;
          color: #1e293b;
        }

        .guarantee-text {
          font-size: 12px;
          color: #64748b;
        }

        @media (max-width: 768px) {
          .main-price-section {
            flex-direction: column;
            align-items: flex-start;
            gap: 16px;
          }

          .total-price {
            font-size: 28px;
          }

          .comparison-grid {
            grid-template-columns: 1fr;
          }

          .savings-grid {
            grid-template-columns: 1fr;
          }

          .guarantees-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}