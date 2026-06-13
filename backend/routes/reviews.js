// =================== Reviews Routes ===================
import express from 'express';
import pool from '../config/database.js';
import protect from '../middleware/auth.js';

const router = express.Router();

// Common query block to map user profile info dynamically from the three target tables
const buildReviewsSelectQuery = (whereClause = '') => {
    return `
        SELECT r.*,
          COALESCE(
            (SELECT fullname FROM users.user_profiles WHERE id = r.reviewer_id),
            (SELECT fullname FROM users.patients WHERE id = r.reviewer_id),
            (SELECT fullname FROM users.community_health_workers WHERE id = r.reviewer_id)
          ) AS reviewer_name,
          CASE LOWER(
            COALESCE(
              (SELECT role FROM users.user_profiles WHERE id = r.reviewer_id),
              (SELECT 'patient' FROM users.patients WHERE id = r.reviewer_id),
              (SELECT 'chw' FROM users.community_health_workers WHERE id = r.reviewer_id)
            )
          )
            WHEN 'admin' THEN 'Administrator'
            WHEN 'staff' THEN 'Staff Member'
            WHEN 'chw' THEN 'Community Health Worker'
            WHEN 'patient' THEN 'Patient'
            ELSE 'Registered User'
          END AS reviewer_role,
          COALESCE(
            (SELECT organization FROM users.user_profiles WHERE id = r.reviewer_id),
            (SELECT (SELECT organization FROM users.user_profiles WHERE id = p.registra_id) FROM users.patients p WHERE p.id = r.reviewer_id),
            (SELECT (SELECT organization FROM users.user_profiles WHERE id = c.registra_id) FROM users.community_health_workers c WHERE c.id = r.reviewer_id)
          ) AS reviewer_org
        FROM todos.reviews r
        ${whereClause}
        ORDER BY r.created_at DESC
    `;
};

// Retrieve all reviews (publicly accessible, e.g., for landing page)
router.get('/', async (req, res) => {
    try {
        const queryText = buildReviewsSelectQuery();
        const result = await pool.query(queryText);
        return res.json({ reviews: result.rows });
    } catch (error) {
        console.error('Error fetching public reviews:', error);
        return res.status(500).json({ message: 'Server error fetching reviews' });
    }
});

// Retrieve reviews created by the authenticated user
router.get('/my', protect, async (req, res) => {
    try {
        const queryText = buildReviewsSelectQuery('WHERE r.reviewer_id = $1');
        const result = await pool.query(queryText, [req.user.id]);
        return res.json({ reviews: result.rows });
    } catch (error) {
        console.error('Error fetching personal reviews:', error);
        return res.status(500).json({ message: 'Server error fetching your reviews' });
    }
});

// Create a new review
router.post('/', protect, async (req, res) => {
    try {
        const { rating, comment } = req.body;

        if (rating === undefined || rating === null) {
            return res.status(400).json({ message: 'Rating is required' });
        }

        const ratingNum = parseInt(rating);
        if (isNaN(ratingNum) || ratingNum < 0 || ratingNum > 5) {
            return res.status(400).json({ message: 'Rating must be an integer between 0 and 5' });
        }

        const result = await pool.query(
            `INSERT INTO todos.reviews (reviewer_id, rating, comment)
             VALUES ($1, $2, $3)
             RETURNING *`,
            [req.user.id, ratingNum, (comment && comment.trim()) ? comment.trim() : null]
        );

        // Fetch complete mapped record of the created review
        const completeResult = await pool.query(
            buildReviewsSelectQuery('WHERE r.id = $1'),
            [result.rows[0].id]
        );

        return res.status(201).json({ review: completeResult.rows[0] });
    } catch (error) {
        console.error('Error creating review:', error);
        return res.status(500).json({ message: 'Server error creating review' });
    }
});

// Update an existing review
router.put('/:id', protect, async (req, res) => {
    try {
        const { id } = req.params;
        const { rating, comment } = req.body;

        if (rating === undefined || rating === null) {
            return res.status(400).json({ message: 'Rating is required' });
        }

        const ratingNum = parseInt(rating);
        if (isNaN(ratingNum) || ratingNum < 0 || ratingNum > 5) {
            return res.status(400).json({ message: 'Rating must be an integer between 0 and 5' });
        }

        const reviewCheck = await pool.query('SELECT reviewer_id FROM todos.reviews WHERE id = $1', [id]);
        if (reviewCheck.rows.length === 0) {
            return res.status(404).json({ message: 'Review not found' });
        }

        // Ownership validation
        if (Number(reviewCheck.rows[0].reviewer_id) !== Number(req.user.id)) {
            return res.status(403).json({ message: 'Access denied. You are not authorized to update this review.' });
        }

        await pool.query(
            `UPDATE todos.reviews 
             SET rating = $1, comment = $2, created_at = CURRENT_TIMESTAMP
             WHERE id = $3`,
            [ratingNum, (comment && comment.trim()) ? comment.trim() : null, id]
        );

        const completeResult = await pool.query(
            buildReviewsSelectQuery('WHERE r.id = $1'),
            [id]
        );

        return res.json({ review: completeResult.rows[0] });
    } catch (error) {
        console.error('Error updating review:', error);
        return res.status(500).json({ message: 'Server error updating review' });
    }
});

// Delete an existing review
router.delete('/:id', protect, async (req, res) => {
    try {
        const { id } = req.params;

        const reviewCheck = await pool.query('SELECT reviewer_id FROM todos.reviews WHERE id = $1', [id]);
        if (reviewCheck.rows.length === 0) {
            return res.status(404).json({ message: 'Review not found' });
        }

        // Ownership validation
        if (Number(reviewCheck.rows[0].reviewer_id) !== Number(req.user.id)) {
            return res.status(403).json({ message: 'Access denied. You are not authorized to delete this review.' });
        }

        await pool.query('DELETE FROM todos.reviews WHERE id = $1', [id]);
        return res.json({ message: 'Review deleted successfully', id });
    } catch (error) {
        console.error('Error deleting review:', error);
        return res.status(500).json({ message: 'Server error deleting review' });
    }
});

export default router;
