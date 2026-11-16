import unittest

from checkout import Item, cart_total, format_eur


class CartTotalTest(unittest.TestCase):
    def test_empty_cart(self):
        total = cart_total([])
        self.assertEqual((total.net_cents, total.vat_cents, total.gross_cents), (0, 0, 0))

    def test_single_standard_item(self):
        total = cart_total([Item("Coffee", 1000)])
        self.assertEqual(total.vat_cents, 190)
        self.assertEqual(total.gross_cents, 1190)

    def test_mixed_rates_are_summed_per_rate(self):
        total = cart_total(
            [
                Item("Book", 1500, vat="reduced"),
                Item("Mug", 899, quantity=2),
            ]
        )
        self.assertEqual(total.net_cents, 1500 + 1798)
        # 7 % of 15.00 = 1.05 ; 19 % of 17.98 = 3.4162 -> 3.42
        self.assertEqual(total.vat_cents, 105 + 342)

    def test_rounding_half_up(self):
        # 19 % of 0.50 = 0.095 -> 0.10
        self.assertEqual(cart_total([Item("Cookie", 50)]).vat_cents, 10)

    def test_invalid_items_are_rejected(self):
        with self.assertRaises(ValueError):
            Item("Free?", -1)
        with self.assertRaises(ValueError):
            Item("Nothing", 100, quantity=0)
        with self.assertRaises(ValueError):
            Item("Exotic", 100, vat="luxury")


class FormatTest(unittest.TestCase):
    def test_format_eur(self):
        self.assertEqual(format_eur(1234), "12.34 EUR")
        self.assertEqual(format_eur(5), "0.05 EUR")
        self.assertEqual(format_eur(-250), "-2.50 EUR")


if __name__ == "__main__":
    unittest.main()
